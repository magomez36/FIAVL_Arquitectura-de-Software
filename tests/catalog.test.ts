import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { artistSchema, venueSchema, eventSchema, healthSchema, errorSchema } from '@fiavl/contracts';
import { openDatabase } from '../apps/api/src/db.ts';
import { seed } from '../apps/api/src/seed.ts';
import { startTestApi } from './helpers/api.ts';

test('catálogo persistente e idempotente, accesible por HTTP', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'fiavl-catalog-'));
  const file = join(dir, 'catalog.sqlite');
  const first = openDatabase(file);
  seed(first);
  const snapshot = (db: typeof first) => ['events', 'artists', 'venues', 'event_artists'].map(
    name => db.prepare('SELECT * FROM ' + name + ' ORDER BY rowid').all()
  );
  const before = snapshot(first);
  seed(first);
  assert.deepEqual(snapshot(first), before);
  first.close();
  const db = openDatabase(file);
  assert.deepEqual(snapshot(db), before);
  const get = await startTestApi(t, db);
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  healthSchema.parse(await (await get('health')).json());
  for (const [path, count, schema] of [
    ['events', 12, eventSchema], ['artists', 6, artistSchema], ['venues', 5, venueSchema]
  ] as const) {
    const response = await get(path);
    assert.equal(response.status, 200);
    const items = schema.array().parse(await response.json());
    assert.equal(items.length, count);
    for (const item of items) {
      const detail = await get(path + '/' + item.id);
      assert.equal(detail.status, 200);
      assert.deepEqual(await detail.json(), item);
    }
    assert.equal((await get(path + '/desconocido')).status, 404);
  }
  const events = eventSchema.array().parse(await (await get('events')).json());
  assert(events.some(e => e.reservable && e.capacity > 0 && e.capacity <= 3));
  assert(events.some(e => !e.reservable));
  assert(events.some((a, i) => events.some((b, j) => j > i && b.startAt < a.endAt && a.startAt < b.endAt)));
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
  db.prepare('UPDATE events SET title=? WHERE id=?').run('Ensayo de lectura', events[0].id);
  const changed = await get('events/' + events[0].id);
  assert.equal(eventSchema.parse(await changed.json()).title, 'Ensayo de lectura');
  for (const [path, status, code] of [
    ['events/BAD', 400, 'INVALID_ID'], ['events/missing', 404, 'NOT_FOUND']
  ] as const) {
    const res = await get(path);
    assert.equal(res.status, status);
    assert.equal(errorSchema.parse(await res.json()).error.code, code);
  }
});
