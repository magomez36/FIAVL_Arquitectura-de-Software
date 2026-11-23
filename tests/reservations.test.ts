import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { errorSchema } from '@fiavl/contracts';
import { composeApp } from '../apps/api/src/composition.ts';
import { openDatabase } from '../apps/api/src/db.ts';
import { seed } from '../apps/api/src/seed.ts';
import { createReservationService, hashReference, lojaTimestamp, type ReservationRepository } from '../apps/api/src/services/reservations.ts';

async function serve(db: DatabaseSync) {
  const server = composeApp(db).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const addr = server.address();
  assert(addr && typeof addr === 'object');
  const base = 'http://127.0.0.1:' + addr.port + '/api/';
  const json = (path: string, method: string, body?: string) => fetch(base + path, {
    method, headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body
  });
  return {
    get: (path: string) => json(path, 'GET'),
    raw: (path: string, init: RequestInit) => fetch(base + path, init),
    post: (path: string, body?: unknown) => json(path, 'POST', body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body)),
    reserve: (eventId: string, quantity: unknown) => json('reservations', 'POST', JSON.stringify({ eventId, quantity })),
    remaining: async (eventId: string) => (await (await json('reservations/availability/' + eventId, 'GET')).json()).remaining as number,
    close: async () => {
      await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
      db.close();
    }
  };
}
async function seeded() {
  const db = openDatabase(':memory:');
  seed(db);
  return { db, api: await serve(db) };
}
async function expectError(res: Response, status: number, code: string) {
  assert.equal(res.status, status);
  const { error } = errorSchema.parse(await res.json());
  assert.equal(error.code, code);
  return error.message;
}
function tempFile() {
  const dir = mkdtempSync(join(tmpdir(), 'fiavl-reservations-'));
  return { dir, file: join(dir, 'demo.sqlite'), done: () => rmSync(dir, { recursive: true, force: true }) };
}

test('disponibilidad: plazas restantes desde el servidor, no la capacidad', async () => {
  const { api } = await seeded();
  try {
    const res = await api.get('reservations/availability');
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const list = await res.json() as { eventId: string; capacity: number; reserved: number; remaining: number; reservable: boolean }[];
    assert.equal(list.length, 12);
    assert.deepEqual(list.find(a => a.eventId === 'umbral-de-luz'), { eventId: 'umbral-de-luz', capacity: 3, reserved: 0, remaining: 3, reservable: true });
    assert.equal(list.find(a => a.eventId === 'el-rio-suena')?.reservable, false);
    assert.equal((await api.reserve('umbral-de-luz', 2)).status, 201);
    assert.equal(await api.remaining('umbral-de-luz'), 1);
    assert.equal((await (await api.get('reservations/availability/umbral-de-luz')).json()).capacity, 3);
    await expectError(await api.get('reservations/availability/no-existe'), 404, 'NOT_FOUND');
    await expectError(await api.get('reservations/availability/MAL_ID'), 400, 'INVALID_ID');
  } finally { await api.close(); }
});

test('crear, consultar y cancelar con referencia opaca; la doble cancelación no libera dos veces', async () => {
  const { db, api } = await seeded();
  try {
    const created = await api.reserve('mapa-sonoro', 1);
    assert.equal(created.status, 201);
    const reservation = await created.json();
    assert.match(reservation.reference, /^[A-Za-z0-9_-]{32}$/);
    assert.deepEqual({ ...reservation, reference: undefined, createdAt: undefined }, {
      eventId: 'mapa-sonoro', quantity: 1, status: 'active', cancelledAt: null, remaining: 1, reference: undefined, createdAt: undefined
    });
    assert.match(reservation.createdAt, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d-05:00$/);
    // La referencia en claro no se guarda.
    const stored = db.prepare('SELECT referenceHash FROM reservations').get();
    assert.equal(stored?.referenceHash, hashReference(reservation.reference));
    assert.notEqual(stored?.referenceHash, reservation.reference);
    assert.equal(await api.remaining('mapa-sonoro'), 1);

    const read = await api.get('reservations/' + reservation.reference);
    assert.equal(read.status, 200);
    assert.equal((await read.json()).status, 'active');

    const other = await (await api.reserve('mapa-sonoro', 1)).json();
    assert.equal(await api.remaining('mapa-sonoro'), 0);
    const first = await api.post(`reservations/${reservation.reference}/cancel`);
    assert.equal(first.status, 200);
    const cancelled = await first.json();
    assert.equal(cancelled.status, 'cancelled');
    assert.match(cancelled.cancelledAt, /-05:00$/);
    assert.equal(await api.remaining('mapa-sonoro'), 1);
    const again = await api.post(`reservations/${reservation.reference}/cancel`);
    assert.equal(again.status, 200);
    assert.deepEqual(await again.json(), cancelled);
    assert.equal(await api.remaining('mapa-sonoro'), 1, 'no libera dos veces');
    assert.equal((await (await api.get('reservations/' + other.reference)).json()).status, 'active');
  } finally { await api.close(); }
});

test('no se puede cancelar la reserva ajena por ID secuencial ni por referencia desconocida', async () => {
  const { api } = await seeded();
  try {
    const mine = await (await api.reserve('umbral-de-luz', 1)).json();
    for (const guess of ['1', '2', '0', 'abc', 'x'.repeat(31), 'x'.repeat(33)]) {
      await expectError(await api.post(`reservations/${guess}/cancel`), 400, 'INVALID_ID');
      await expectError(await api.get('reservations/' + guess), 400, 'INVALID_ID');
    }
    await expectError(await api.post('reservations/' + 'A'.repeat(32) + '/cancel'), 404, 'NOT_FOUND');
    await expectError(await api.get('reservations/' + 'A'.repeat(32)), 404, 'NOT_FOUND');
    assert.equal((await (await api.get('reservations/' + mine.reference)).json()).status, 'active');
    assert.equal(await api.remaining('umbral-de-luz'), 2);
  } finally { await api.close(); }
});

test('entradas inválidas, evento inexistente y no reservable no modifican el aforo', async () => {
  const { api } = await seeded();
  try {
    for (const quantity of [0, -1, 1.5, '2', null, 11, 1e9]) {
      await expectError(await api.reserve('umbral-de-luz', quantity), 400, 'INVALID_INPUT');
    }
    for (const body of ['{', '[]', 'null', '{}', '{"eventId":"umbral-de-luz"}', '{"quantity":1}', '{"eventId":"Mal Id","quantity":1}',
      '{"eventId":"umbral-de-luz","quantity":1,"name":"Ana"}']) {
      await expectError(await api.post('reservations', body), 400, 'INVALID_INPUT');
    }
    await expectError(await api.post('reservations', JSON.stringify({ eventId: 'umbral-de-luz', quantity: 1, pad: 'x'.repeat(2000) })), 413, 'INVALID_INPUT');
    await expectError(await api.raw('reservations', { method: 'POST', body: JSON.stringify({ eventId: 'umbral-de-luz', quantity: 1 }) }), 400, 'INVALID_INPUT');
    await expectError(await api.reserve('no-existe', 1), 404, 'NOT_FOUND');
    await expectError(await api.reserve('el-rio-suena', 1), 422, 'INVALID_INPUT');
    assert.equal(await api.remaining('umbral-de-luz'), 3);
    assert.equal(await api.remaining('el-rio-suena'), 80);
    assert.equal((await api.get('reservations/availability')).status, 200);
  } finally { await api.close(); }
});

test('aforo: sobreventa rechazada, saldo exacto aceptado y capacidad 0', async () => {
  const { db, api } = await seeded();
  try {
    db.exec("UPDATE events SET capacity = 0 WHERE id = 'hilos-de-agua'");
    const zero = await expectError(await api.reserve('hilos-de-agua', 1), 409, 'INVALID_INPUT');
    assert.match(zero, /No quedan plazas/);
    assert.equal(await api.remaining('hilos-de-agua'), 0);
    assert.equal((await api.reserve('umbral-de-luz', 3)).status, 201);
    assert.equal(await api.remaining('umbral-de-luz'), 0);
    assert.match(await expectError(await api.reserve('umbral-de-luz', 1), 409, 'INVALID_INPUT'), /No quedan plazas/);
    assert.equal((await api.reserve('papel-en-escena', 10)).status, 201);
    assert.equal((await api.reserve('papel-en-escena', 10)).status, 201);
    assert.match(await expectError(await api.reserve('papel-en-escena', 5), 409, 'INVALID_INPUT'), /Solo quedan 4 plazas/);
    assert.equal(await api.remaining('papel-en-escena'), 4);
    assert.match(await expectError(await api.reserve('mapa-sonoro', 3), 409, 'INVALID_INPUT'), /Solo quedan 2 plazas/);
  } finally { await api.close(); }
});

test('dos reservas concurrentes con saldo insuficiente no sobrevenden (una y dos conexiones)', async () => {
  const same = await seeded();
  try {
    const results = await Promise.all([same.api.reserve('umbral-de-luz', 2), same.api.reserve('umbral-de-luz', 2)]);
    assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
    assert.equal(await same.api.remaining('umbral-de-luz'), 1);
  } finally { await same.api.close(); }

  const { file, done } = tempFile();
  try {
    const first = openDatabase(file);
    seed(first);
    const second = openDatabase(file);
    const [a, b] = [await serve(first), await serve(second)];
    try {
      const results = await Promise.all(Array.from({ length: 6 }, (_, i) => (i % 2 ? a : b).reserve('mapa-sonoro', 1)));
      assert.equal(results.filter(r => r.status === 201).length, 2);
      assert.equal(results.filter(r => r.status === 409).length, 4);
      assert.equal(await a.remaining('mapa-sonoro'), 0);
      assert.equal(first.prepare("SELECT SUM(quantity) AS n FROM reservations WHERE status='active'").get()?.n, 2);
    } finally { await a.close(); await b.close(); }
  } finally { done(); }
});

test('persistencia tras reabrir la base y recuperación de la reserva por su referencia', async () => {
  const { file, done } = tempFile();
  try {
    const first = openDatabase(file);
    seed(first);
    let api = await serve(first);
    const created = await (await api.reserve('umbral-de-luz', 2)).json();
    await api.close();
    api = await serve(openDatabase(file));
    try {
      assert.equal(await api.remaining('umbral-de-luz'), 1);
      assert.equal((await (await api.get('reservations/' + created.reference)).json()).quantity, 2);
      await api.post(`reservations/${created.reference}/cancel`);
    } finally { await api.close(); }
    api = await serve(openDatabase(file));
    try { assert.equal(await api.remaining('umbral-de-luz'), 3); } finally { await api.close(); }
  } finally { done(); }
});

test('la migración 006 convive con 010 en una base limpia y en una con 001 y 010 ya aplicadas', async () => {
  const fresh = openDatabase(':memory:');
  assert.deepEqual(fresh.prepare('SELECT number, name FROM migrations ORDER BY number').all().map(r => [r.number, r.name]),
    [[1, '001_base.sql'], [6, '006_reservations.sql'], [10, '010_feedback.sql']]);
  fresh.close();

  const { file, done } = tempFile();
  try {
    const old = new DatabaseSync(file);
    old.exec('CREATE TABLE migrations(number INTEGER PRIMARY KEY, name TEXT NOT NULL) STRICT');
    for (const name of ['001_base.sql', '010_feedback.sql']) {
      old.exec(readFileSync(new URL('../apps/api/migrations/' + name, import.meta.url), 'utf8'));
      old.prepare('INSERT INTO migrations VALUES (?,?)').run(Number(name.slice(0, 3)), name);
    }
    old.exec("INSERT INTO feedback (rating, comment) VALUES (5, 'Excelente'), (3, NULL), (5, NULL)");
    const before = old.prepare('SELECT id, rating, comment FROM feedback ORDER BY id').all().map(r => ({ ...r }));
    old.close();

    const upgraded = openDatabase(file);
    assert.deepEqual(upgraded.prepare('SELECT number FROM migrations ORDER BY number').all().map(r => r.number), [1, 6, 10]);
    assert.deepEqual(upgraded.prepare('SELECT id, rating, comment FROM feedback ORDER BY id').all().map(r => ({ ...r })), before);
    seed(upgraded);
    const api = await serve(upgraded);
    try {
      const summary = await (await api.get('feedback/summary')).json();
      assert.deepEqual(summary, { total: 3, distribution: [0, 0, 1, 0, 2], average: 4.3 });
      assert.equal((await api.reserve('umbral-de-luz', 1)).status, 201);
      assert.equal((await api.post('feedback', { rating: 4 })).status, 201);
      assert.equal((await (await api.get('feedback/summary')).json()).total, 4);
    } finally { await api.close(); }
    const again = openDatabase(file);
    assert.equal(again.prepare('SELECT COUNT(*) AS n FROM migrations').get()?.n, 3);
    assert.equal(again.prepare('SELECT COUNT(*) AS n FROM feedback').get()?.n, 4);
    again.close();
  } finally { done(); }
});

test('la base rechaza reservas incoherentes aunque se salte el servicio', () => {
  const db = openDatabase(':memory:');
  seed(db);
  const insert = (hash: string, qty: number, status: string, cancelled: string | null) => () => db.prepare(
    'INSERT INTO reservations (referenceHash, eventId, quantity, status, createdAt, cancelledAt) VALUES (?,?,?,?,?,?)'
  ).run(hash, 'umbral-de-luz', qty, status, '2026-11-12T10:00:00-05:00', cancelled);
  const h = (c: string) => c.repeat(64);
  assert.throws(insert(h('a'), 0, 'active', null));
  assert.throws(insert(h('b'), 1, 'cancelled', null));
  assert.throws(insert(h('c'), 1, 'active', '2026-11-12T11:00:00-05:00'));
  assert.throws(insert('corto', 1, 'active', null));
  insert(h('d'), 1, 'active', null)();
  assert.throws(insert(h('d'), 1, 'active', null));
  assert.throws(() => db.prepare("INSERT INTO reservations (referenceHash, eventId, quantity, status, createdAt) VALUES (?, 'fantasma', 1, 'active', '2026-11-12T10:00:00-05:00')").run(h('e')));
  db.close();
});

test('servicio: reloj y referencia inyectables; la hora civil es de Loja y un fallo revierte la transacción', () => {
  assert.equal(lojaTimestamp(new Date('2026-11-12T23:30:00Z')), '2026-11-12T18:30:00-05:00');
  assert.equal(lojaTimestamp(new Date('2026-11-13T02:00:00Z')), '2026-11-12T21:00:00-05:00');
  const calls: string[] = [];
  const repository: ReservationRepository = {
    listEvents: () => [],
    atomically(work) {
      calls.push('begin');
      try {
        return work({
          findEvent: () => ({ id: 'e', capacity: 2, reservable: true }), reservedFor: () => 0,
          insert: () => { throw new Error('fallo de disco'); }, findByHash: () => undefined, cancel: () => undefined
        });
      } finally { calls.push('end'); }
    }
  };
  const service = createReservationService(repository, () => new Date('2026-11-12T23:30:00Z'), () => 'R'.repeat(32));
  assert.throws(() => service.create({ eventId: 'e', quantity: 1 }), /fallo de disco/);
  assert.deepEqual(calls, ['begin', 'end']);
  assert.deepEqual(service.create({ eventId: 'e', quantity: 0 }), { kind: 'invalid' });
});

test('un fallo del almacenamiento hace ROLLBACK y no deja reservas parciales ni transacción abierta', async () => {
  const { db, api } = await seeded();
  try {
    db.exec("CREATE TRIGGER falla BEFORE INSERT ON reservations BEGIN SELECT RAISE(ABORT, 'disco lleno'); END");
    const original = console.error;
    console.error = () => undefined;
    try { await expectError(await api.reserve('umbral-de-luz', 1), 500, 'INTERNAL_ERROR'); } finally { console.error = original; }
    db.exec('DROP TRIGGER falla');
    assert.equal(db.isTransaction, false);
    assert.equal((await api.reserve('umbral-de-luz', 3)).status, 201);
  } finally { await api.close(); }
});

test('el router no usa SQL ni la conexión; el SQL vive en el repositorio', () => {
  const read = (p: string) => readFileSync(new URL('../apps/api/src/' + p, import.meta.url), 'utf8');
  assert.doesNotMatch(read('features/reservations.ts'), /sqlite|SELECT|INSERT|UPDATE|db\./i);
  assert.doesNotMatch(read('services/reservations.ts'), /sqlite|SELECT |INSERT |UPDATE |DatabaseSync/);
  assert.match(read('services/reservations.ts'), /randomBytes\(24\)\.toString\('base64url'\)/);
  assert.doesNotMatch(read('services/reservations.ts') + read('features/reservations.ts') + read('repositories/reservations.ts'), /console\.|Math\.random/);
  assert.match(read('repositories/reservations.ts'), /BEGIN IMMEDIATE/);
  assert.match(read('repositories/reservations.ts'), /ROLLBACK/);
});
