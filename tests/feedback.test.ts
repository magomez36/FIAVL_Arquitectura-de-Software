import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { composeApp } from '../apps/api/src/composition.ts';
import { openDatabase } from '../apps/api/src/db.ts';

async function serve(db: DatabaseSync) {
  const server = composeApp(db).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const addr = server.address();
  assert(addr && typeof addr === 'object');
  const url = 'http://127.0.0.1:' + addr.port + '/api/feedback';
  return {
    post: (body: string) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }),
    summary: async () => {
      const res = await fetch(url + '/summary');
      assert.equal(res.status, 200);
      return res.json();
    },
    close: async () => {
      await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
      db.close();
    }
  };
}

test('encuesta válida, actualización de base existente, agregado y persistencia', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'fiavl-feedback-'));
  const file = join(dir, 'demo.sqlite');
  try {
    const base = new DatabaseSync(file);
    base.exec("CREATE TABLE migrations(number INTEGER PRIMARY KEY, name TEXT NOT NULL) STRICT; INSERT INTO migrations VALUES(1,'001_base.sql')");
    base.exec(readFileSync(new URL('../apps/api/migrations/001_base.sql', import.meta.url), 'utf8'));
    base.close();
    const api = await serve(openDatabase(file));
    try {
      assert.deepEqual(await api.summary(), { total: 0, distribution: [0,0,0,0,0], average: null });
      for (const entry of [{ rating: 1 }, { rating: 5, comment: ' opinión privada ' }, { rating: 5 }]) {
        const res = await api.post(JSON.stringify(entry));
        assert.equal(res.status, 201);
        assert.deepEqual(await res.json(), { accepted: true });
      }
    } finally { await api.close(); }
    const db = openDatabase(file);
    assert.equal(db.prepare('SELECT comment FROM feedback WHERE comment IS NOT NULL').get()?.comment, 'opinión privada');
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM migrations WHERE number=10').get()?.n, 1);
    const reopened = await serve(db);
    try {
      assert.deepEqual(await reopened.summary(), { total: 3, distribution: [1,0,0,0,2], average: 3.7 });
    } finally { await reopened.close(); }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('rechaza entradas inválidas y cuerpos excesivos sin guardar respuestas', async () => {
  const api = await serve(openDatabase(':memory:'));
  try {
    for (const body of ['{', '{}', 'null', '{"rating":0}', '{"rating":6}', '{"rating":"3"}', '{"rating":1.5}',
      '{"rating":3,"email":"x"}', '{"rating":3,"comment":3}', JSON.stringify({ rating: 3, comment: 'x'.repeat(501) })]) {
      const res = await api.post(body);
      assert.equal(res.status, 400);
      assert.equal((await res.json()).error.code, 'INVALID_INPUT');
    }
    const large = await api.post(JSON.stringify({ rating: 3, comment: 'x'.repeat(9000) }));
    assert.equal(large.status, 413);
    assert.equal((await large.json()).error.code, 'INVALID_INPUT');
    assert.equal((await api.summary()).total, 0);
    assert.equal((await api.post(JSON.stringify({ rating: 3, comment: 'x'.repeat(500) }))).status, 201);
  } finally { await api.close(); }
});
