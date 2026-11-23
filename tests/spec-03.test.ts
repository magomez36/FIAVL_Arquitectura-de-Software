import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import type { Artist, Event, Venue } from '@fiavl/contracts';
import {
  countries, disciplines, emptyFilters, filterArtists, formatWhen, performancesOf
} from '../apps/web/src/features/artistas/logic.ts';

const artist = (id: string, name: string, country: string, discipline: string): Artist =>
  ({ id, name, bio: 'Bio ' + name, country, discipline, image: '/art/danza.svg' });
const artists = [
  artist('ines-luz', 'Inés Luz', 'Ecuador', 'Música'),
  artist('taller-nudo', 'Taller Nudo', 'Perú', 'Teatro'),
  artist('ensamble-cauce', 'Ensamble Cauce', 'Ecuador', 'Música'),
  artist('colectivo-umbral', 'Colectivo Umbral', 'Ecuador', 'Danza')
];
const ev = (id: string, startAt: string, artistIds: string[], venueId = 'v1'): Event => ({
  id, title: 'T-' + id, description: 'd', category: 'Danza', startAt, endAt: startAt.replace(/:00-05:00$/, ':59-05:00'),
  venueId, artistIds, priceCents: 0, capacity: 1, reservable: false, image: '/art/x.svg'
});
const venues: Venue[] = [{ id: 'v1', name: 'Teatro del Sur', address: 'a', description: 'd', accessibilityNotes: 'n', image: '/art/teatro.svg' }];

test('búsqueda por nombre sin distinguir mayúsculas ni tildes', () => {
  assert.deepEqual(filterArtists(artists, { ...emptyFilters, query: 'ines' }).map(a => a.id), ['ines-luz']);
  assert.deepEqual(filterArtists(artists, { ...emptyFilters, query: '  CAUCE ' }).map(a => a.id), ['ensamble-cauce']);
});
test('país y disciplina se combinan con la búsqueda; limpiar restaura todo', () => {
  assert.deepEqual(filterArtists(artists, { ...emptyFilters, country: 'Ecuador', discipline: 'Música' }).map(a => a.id), ['ines-luz', 'ensamble-cauce']);
  assert.deepEqual(filterArtists(artists, { query: 'cauce', country: 'Ecuador', discipline: 'Música' }).map(a => a.id), ['ensamble-cauce']);
  assert.equal(filterArtists(artists, { query: 'cauce', country: 'Perú', discipline: '' }).length, 0);
  assert.equal(filterArtists(artists, emptyFilters).length, artists.length);
});
test('opciones únicas y ordenadas desde los datos', () => {
  assert.deepEqual(countries(artists), ['Ecuador', 'Perú']);
  assert.deepEqual(disciplines(artists), ['Danza', 'Música', 'Teatro']);
  assert.deepEqual(countries([]), []);
});
test('actuaciones por artistIds, ordenadas por inicio e id; sin actuaciones → vacío', () => {
  const events = [
    ev('b', '2026-11-13T19:00:00-05:00', ['ines-luz', 'taller-nudo']),
    ev('a', '2026-11-13T19:00:00-05:00', ['ines-luz']),
    ev('c', '2026-11-12T10:00:00-05:00', ['ines-luz'], 'desconocida'),
    ev('d', '2026-11-12T10:00:00-05:00', ['otro'])
  ];
  const list = performancesOf('ines-luz', events, venues);
  assert.deepEqual(list.map(p => p.event.id), ['c', 'a', 'b']);
  assert.equal(list[0].venue, undefined);
  assert.equal(list[1].venue?.name, 'Teatro del Sur');
  assert.deepEqual(performancesOf('ensamble-cauce', events, venues), []);
});
test('fecha en hora de Loja, sin desplazamiento por UTC', () => {
  assert.match(formatWhen('2026-11-12T18:00:00-05:00'), /12 de noviembre.*18:00/);
  assert.match(formatWhen('2026-11-12T23:30:00-05:00'), /12 de noviembre.*23:30/);
});
test('integración: entrada propia activa, sin dependencia de otros specs ni backend', () => {
  const page = readFileSync(new URL('../apps/web/src/features/artistas/index.tsx', import.meta.url), 'utf8');
  assert.match(page, /path: '\/artistas'/);
  assert.match(page, /available: true/);
  assert.doesNotMatch(page, /features\/agenda|\.\.\/agenda|\/api\/|fetch\(/);
  assert.match(page, /getResource\('artists'/);
  assert.match(page, /getResource\('events'/);
  assert.match(page, /getResource\('venues'/);
});
