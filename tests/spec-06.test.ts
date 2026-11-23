import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { afterEach, test } from 'node:test';
import {
  MAX_STORED, checkQuantity, formatWhen, parseStored, plazas, remainingOf, remember, reservableEvents, serializeStored, reservationSchema
} from '../apps/web/src/features/reservas/logic.ts';
import { readLocal, writeLocal } from '../apps/web/src/lib/storage.ts';

const ref = (c: string) => c.repeat(32);
const item = (c: string) => ({ reference: ref(c), eventId: 'umbral-de-luz', quantity: 1 });

test('cantidad: entero positivo, tope por reserva y plazas restantes', () => {
  assert.deepEqual(checkQuantity('2', 3), { ok: true, quantity: 2 });
  assert.deepEqual(checkQuantity(' 3 ', 3), { ok: true, quantity: 3 });
  for (const bad of ['', '0', '-1', '1.5', '1,5', 'abc', '1e2', '+1']) assert.equal(checkQuantity(bad, 5).ok, false, bad);
  assert.equal(checkQuantity('4', 3).ok, false);
  assert.match(String((checkQuantity('4', 3) as { message: string }).message), /Solo quedan 3 plazas/);
  assert.match(String((checkQuantity('1', 0) as { message: string }).message), /agotado/);
  assert.match(String((checkQuantity('11', 50) as { message: string }).message), /hasta 10/);
});

test('validador de fiavl:reservations:v1: acepta lo propio y rechaza corrupción y datos personales', () => {
  assert.deepEqual(parseStored(serializeStored([item('a'), item('b')])), [item('a'), item('b')]);
  assert.deepEqual(parseStored({ version: 1, items: [] }), []);
  for (const bad of [null, 'x', [], {}, { version: 2, items: [] }, { version: 1 }, { version: 1, items: [{ reference: 'corta', eventId: 'a', quantity: 1 }] },
    { version: 1, items: [{ ...item('a'), name: 'Ana' }] }, { version: 1, items: [{ ...item('a'), quantity: 0 }] },
    { version: 1, items: [item('a'), item('a')] }, { version: 1, items: Array.from({ length: MAX_STORED + 1 }, (_, i) => ({ ...item('a'), reference: String(i).padStart(32, 'z') })) }]) {
    assert.throws(() => parseStored(bad), Error, JSON.stringify(bad)?.slice(0, 60));
  }
});

test('remember coloca la última primero, evita duplicados y respeta el máximo', () => {
  assert.deepEqual(remember([item('a'), item('b')], item('b')).map(i => i.reference[0]), ['b', 'a']);
  const many = Array.from({ length: MAX_STORED }, (_, i) => ({ ...item('a'), reference: String(i).padStart(32, 'z') }));
  const next = remember(many, item('q'));
  assert.equal(next.length, MAX_STORED);
  assert.equal(next[0].reference, ref('q'));
});

const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
afterEach(() => { if (original) Object.defineProperty(globalThis, 'window', original); else delete (globalThis as { window?: unknown }).window; });
const withStorage = (localStorage: Partial<Storage>) => Object.defineProperty(globalThis, 'window', { value: { localStorage }, configurable: true, writable: true });

test('almacenamiento: valor válido, corrupto y bloqueado no rompen la lectura ni la escritura', () => {
  const data = new Map<string, string>();
  withStorage({ getItem: k => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) });
  assert.equal(writeLocal('reservations', serializeStored([item('a')])), true);
  assert.deepEqual(readLocal('reservations', parseStored), [item('a')]);
  data.set('fiavl:reservations:v1', '{no es json');
  assert.equal(readLocal('reservations', parseStored), undefined);
  data.set('fiavl:reservations:v1', JSON.stringify({ version: 1, items: [{ reference: 'x', eventId: 'a', quantity: 1 }] }));
  assert.equal(readLocal('reservations', parseStored), undefined);
  const denied = () => { throw new DOMException('bloqueado', 'SecurityError'); };
  withStorage({ getItem: denied, setItem: denied });
  assert.equal(readLocal('reservations', parseStored), undefined);
  assert.equal(writeLocal('reservations', serializeStored([item('a')])), false);
});

test('contrato de respuesta, eventos reservables, plazas y hora de Loja', () => {
  const created = { reference: ref('a'), eventId: 'umbral-de-luz', quantity: 2, status: 'active', createdAt: '2026-11-12T10:00:00-05:00', cancelledAt: null, remaining: 1 };
  assert.deepEqual(reservationSchema.parse(created), created);
  assert.throws(() => reservationSchema.parse({ ...created, name: 'Ana' }));
  assert.throws(() => reservationSchema.parse({ ...created, quantity: 0 }));
  assert.deepEqual(reservableEvents([{ id: 'a', reservable: true }, { id: 'b', reservable: false }] as never).map(e => e.id), ['a']);
  const availability = [{ eventId: 'a', capacity: 3, reserved: 1, remaining: 2, reservable: true }];
  assert.equal(remainingOf(availability, 'a'), 2);
  assert.equal(remainingOf(availability, 'zzz'), 0);
  assert.equal(plazas(1), '1 plaza');
  assert.equal(plazas(3), '3 plazas');
  assert.match(formatWhen('2026-11-12T23:30:00-05:00'), /12 de noviembre.*23:30/);
});

test('integración: entrada propia activa, cliente compartido y sin dependencia de /agenda ni /mi-agenda', () => {
  const page = readFileSync(new URL('../apps/web/src/features/reservas/index.tsx', import.meta.url), 'utf8');
  assert.match(page, /path: '\/reservas'/);
  assert.match(page, /available: true/);
  assert.match(page, /getResource\('events'/);
  assert.doesNotMatch(page, /features\/agenda|\.\.\/agenda|mi-agenda|fetch\(/);
  assert.match(page, /Reserva demostrativa; no equivale a una entrada oficial/);
  assert.match(page, /Prototipo académico no oficial · Datos demo/);
  assert.match(page, /StageSection/);
});
