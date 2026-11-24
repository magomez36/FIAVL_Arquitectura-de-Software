import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import type { Event } from '@fiavl/contracts';
import { addId, conflictsOf, overlaps, parseIds, removeId, resolveAgenda, sortEvents } from '../apps/web/src/features/mi-agenda/logic.ts';

const ev = (id: string, startAt: string, endAt: string): Event => ({
  id, title: 'T' + id, description: 'd', category: 'Danza', startAt, endAt,
  venueId: 'v', artistIds: [], priceCents: 0, capacity: 1, reservable: false, image: '/art/x.svg'
});
const a = ev('a', '2026-11-12T18:00:00-05:00', '2026-11-12T20:00:00-05:00');
const b = ev('b', '2026-11-12T19:00:00-05:00', '2026-11-12T21:00:00-05:00');
const c = ev('c', '2026-11-12T20:00:00-05:00', '2026-11-12T22:00:00-05:00');

test('añadir y quitar sin duplicar identificadores', () => {
  assert.deepEqual(addId(addId([], 'a'), 'a'), ['a']);
  assert.deepEqual(removeId(['a', 'b'], 'a'), ['b']);
  assert.deepEqual(removeId(['a'], 'zzz'), ['a']);
});
test('solapamiento estricto: tocar extremos no es conflicto', () => {
  assert.equal(overlaps(a, b), true);
  assert.equal(overlaps(a, c), false);
  assert.deepEqual(conflictsOf(a, [a, b, c]).map(e => e.id), ['b']);
});
test('agenda cronológica e IDs que ya no existen', () => {
  const { found, missing } = resolveAgenda(['c', 'x', 'a'], [a, b, c]);
  assert.deepEqual(found.map(e => e.id), ['a', 'c']);
  assert.deepEqual(missing, ['x']);
});
test('datos guardados corruptos se rechazan y los duplicados se limpian', () => {
  assert.deepEqual(parseIds(['a', 'a', 'b']), ['a', 'b']);
  for (const bad of [{}, 'a', [1], [''], null]) assert.throws(() => parseIds(bad));
});
test('estructura: Stage, tokens, foco, movimiento reducido y sin reservas', () => {
  const page = readFileSync(new URL('../apps/web/src/features/mi-agenda/index.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../apps/web/src/features/mi-agenda/mi-agenda.css', import.meta.url), 'utf8');
  for (const name of ['StageSection', 'StageHeading', 'StageCard', 'StageBadge', 'StageButton']) assert.match(page, new RegExp(name));
  assert.match(page, /available: true/);
  assert.match(page, /Prototipo académico no oficial · Datos demo/);
  assert.match(page, /readLocal\('agenda'/);
  assert.match(page, /writeLocal\('agenda'/);
  assert.doesNotMatch(page, /localStorage|reservations|method: 'POST'/);
  for (const token of ['--stage-gap', '--stage-radius', '--stage-wine', '--stage-ink']) assert.ok(css.includes(token));
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});

test('conflictos múltiples y orden determinista con el mismo inicio', () => {
  const d = ev('d', '2026-11-12T19:30:00-05:00', '2026-11-12T20:30:00-05:00');
  assert.deepEqual(conflictsOf(b, [a, b, c, d]).map(e => e.id).sort(), ['a', 'c', 'd']);
  assert.deepEqual(conflictsOf(a, [a, c]).length, 0);
  const same = ev('z', a.startAt, a.endAt);
  const input = [same, a];
  assert.deepEqual(sortEvents(input).map(e => e.id), ['a', 'z']);
  assert.deepEqual(input.map(e => e.id), ['z', 'a'], 'no muta la entrada');
});
test('el foco de Mi agenda no depende del dorado (contraste insuficiente)', () => {
  const css = readFileSync(new URL('../apps/web/src/features/mi-agenda/mi-agenda.css', import.meta.url), 'utf8');
  const focus = css.split('\n').find(l => l.includes('focus-visible')) ?? '';
  assert.match(focus, /--stage-wine/);
  assert.doesNotMatch(focus, /--stage-gold/);
});
test('títulos de tarjeta como h3 y borde de conflicto con tokens de contraste suficiente', () => {
  const dir = '../apps/web/src/features/mi-agenda/';
  const page = readFileSync(new URL(dir + 'index.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL(dir + 'mi-agenda.css', import.meta.url), 'utf8');
  assert.equal(page.match(/<h3 className="mi-agenda-card-title">\{e\.title\}<\/h3>/g)?.length, 2);
  assert.doesNotMatch(page, /<StageHeading>\{e\.title\}/);
  const conflict = css.split('\n').find(l => l.includes('.mi-agenda-conflict')) ?? '';
  assert.match(conflict, /border-left: 4px solid var\(--stage-wine\)/);
  assert.doesNotMatch(conflict, /--stage-gold/);
});
