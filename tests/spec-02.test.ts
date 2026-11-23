import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Event } from '@fiavl/contracts';
import { emptyFilters, filterEvents, formatPrice, formatTime, sortEvents } from '../apps/web/src/features/agenda/logic.ts';

const ev = (id: string, startAt: string, over: Partial<Event> = {}): Event => ({
  id, title: 'T' + id, description: 'Danza urbana', category: 'Danza', startAt, endAt: startAt,
  venueId: 'v1', artistIds: [], priceCents: 0, capacity: 1, reservable: false, image: '/art/x.svg', ...over
});
const data = [
  ev('b', '2026-11-13T19:00:00-05:00', { priceCents: 1550, category: 'Música' }),
  ev('a', '2026-11-13T19:00:00-05:00'),
  ev('c', '2026-11-12T10:00:00-05:00')
];
const names = () => '';

test('orden por inicio y luego id', () => {
  assert.deepEqual(sortEvents(data).map(e => e.id), ['c', 'a', 'b']);
});
test('filtros combinables, limpieza y sin coincidencias', () => {
  assert.equal(filterEvents(data, { ...emptyFilters, price: 'free' }, names).length, 2);
  assert.deepEqual(filterEvents(data, { ...emptyFilters, price: 'paid', category: 'Música' }, names).map(e => e.id), ['b']);
  assert.deepEqual(filterEvents(data, { ...emptyFilters, date: '2026-11-13', query: 'danza', price: 'free' }, names).map(e => e.id), ['a']);
  assert.equal(filterEvents(data, { ...emptyFilters, query: 'zzz' }, names).length, 0);
  assert.equal(filterEvents(data, emptyFilters, names).length, 3);
});
test('precio en USD y gratuito', () => {
  assert.equal(formatPrice(0), 'Gratuito');
  assert.match(formatPrice(1550), /15[.,]50/);
});
test('hora de Loja sin depender de la zona del equipo', () => {
  assert.match(formatTime('2026-11-13T19:00:00-05:00'), /19:00|7:00/);
});

import { readFileSync } from 'node:fs';
import { editionDays } from '../apps/web/src/features/agenda/logic.ts';

const page = readFileSync(new URL('../apps/web/src/features/agenda/index.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../apps/web/src/features/agenda/agenda.css', import.meta.url), 'utf8');

test('la edición cubre del 12 al 22 de noviembre', () => {
  assert.equal(editionDays[0], '2026-11-12');
  assert.equal(editionDays.at(-1), '2026-11-22');
  assert.equal(editionDays.length, 11);
});
test('coherencia visual: componentes Stage, tokens, foco y movimiento reducido', () => {
  for (const name of ['StageSection', 'StageHeading', 'StageCard', 'StageBadge', 'StageButton']) assert.match(page, new RegExp(name));
  assert.match(page, /available: true/);
  assert.match(page, /Prototipo académico no oficial · Datos demo/);
  for (const token of ['--stage-gap', '--stage-radius', '--stage-gold', '--stage-ink']) assert.ok(css.includes(token));
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /minmax\(min\(100%/);
  assert.doesNotMatch(css, /@keyframes/);
});
test('no hay reservas ni almacenamiento en la agenda', () => {
  assert.doesNotMatch(page, /localStorage|reservations|method: 'POST'/);
});
