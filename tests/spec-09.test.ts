import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Venue } from '@fiavl/contracts';
import {
  contrastRatio, defaultPreferences, filterVenues, isDefault, parsePreferences, searchable
} from '../apps/web/src/features/accesibilidad/logic.ts';
import { readLocal, storageKeys, writeLocal } from '../apps/web/src/lib/storage.ts';

const venue = (id: string, name: string, address: string, notes: string): Venue =>
  ({ id, name, address, description: 'd', accessibilityNotes: notes, image: '/art/teatro.svg' });
const venues = [
  venue('a', 'Teatro del Sur', 'Calle del Telón 12', 'Entrada a nivel.'),
  venue('b', 'Casa Ñandú', 'Av. Universitaria', 'Acceso por escalera lateral.')
];

test('preferencias: esquema estricto y versionado', () => {
  assert.deepEqual(parsePreferences({ version: 1, textSize: 'large', contrast: 'high' }), { version: 1, textSize: 'large', contrast: 'high' });
  for (const bad of [null, 'x', {}, { version: 2, textSize: 'normal', contrast: 'standard' },
    { version: 1, textSize: 'huge', contrast: 'standard' }, { version: 1, textSize: 'normal', contrast: 'standard', extra: 1 },
    { version: 1, textSize: 'normal' }]) assert.throws(() => parsePreferences(bad));
  assert.ok(isDefault(defaultPreferences));
  assert.ok(!isDefault({ ...defaultPreferences, contrast: 'high' }));
});

test('búsqueda: sin distinguir mayúsculas, tildes ni espacios; incluye notas', () => {
  assert.equal(searchable('  Telón   DEL  '), 'telon del');
  assert.deepEqual(filterVenues(venues, 'TELON').map(v => v.id), ['a']);
  assert.deepEqual(filterVenues(venues, '  teatro   del sur ').map(v => v.id), ['a']);
  assert.deepEqual(filterVenues(venues, 'nandu').map(v => v.id), ['b']);
  assert.deepEqual(filterVenues(venues, 'escalera').map(v => v.id), ['b']);
  assert.deepEqual(filterVenues(venues, 'rampa'), []);
  assert.equal(filterVenues(venues, '   ').length, 2);
});

test('persistencia con el helper compartido: ida y vuelta, dañado y bloqueado', t => {
  const values = new Map<string, string>();
  let blocked = false;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: {
    setItem: (k: string, v: string) => { if (blocked) throw new Error('bloqueado'); values.set(k, v); },
    getItem: (k: string) => { if (blocked) throw new Error('bloqueado'); return values.get(k) ?? null; }
  } } });
  assert.equal(storageKeys.accessibility, 'fiavl:accessibility:v1');
  const saved = { version: 1, textSize: 'xlarge', contrast: 'high' };
  assert.ok(writeLocal('accessibility', saved));
  assert.deepEqual(readLocal('accessibility', parsePreferences), saved);
  values.set(storageKeys.accessibility, '{no json');
  assert.equal(readLocal('accessibility', parsePreferences), undefined);
  values.set(storageKeys.accessibility, JSON.stringify({ version: 1, textSize: 'enorme', contrast: 'high' }));
  assert.equal(readLocal('accessibility', parsePreferences), undefined);
  blocked = true;
  assert.equal(readLocal('accessibility', parsePreferences), undefined);
  assert.equal(writeLocal('accessibility', saved), false);
});

test('contraste: pares de la guía cumplen WCAG AA (texto 4,5:1; foco/bordes 3:1)', () => {
  assert.ok(contrastRatio('#000000', '#ffffff') > 20.9);
  const pairs: [string, string, number, string][] = [
    ['#302237', '#FFF9F0', 4.5, 'texto estándar'],
    ['#4a3a52', '#FFFFFF', 4.5, 'texto atenuado estándar'],
    ['#F5EDE0', '#591C37', 4.5, 'botón estándar'],
    ['#852D45', '#FFFFFF', 4.5, 'acento estándar'],
    ['#005A6B', '#FFF9F0', 3, 'foco estándar sobre marfil'],
    ['#005A6B', '#FFFFFF', 3, 'foco estándar sobre blanco'],
    ['#FFFFFF', '#0F0914', 4.5, 'texto elevado'],
    ['#FFFFFF', '#000000', 4.5, 'texto sobre tarjeta elevada'],
    ['#0F0914', '#FFD27A', 4.5, 'botón elevado'],
    ['#FFD27A', '#0F0914', 3, 'foco elevado sobre fondo'],
    ['#FFD27A', '#000000', 3, 'foco elevado sobre tarjeta'],
    ['#FFFFFF', '#0F0914', 3, 'bordes elevados']
  ];
  for (const [fg, bg, min, name] of pairs)
    assert.ok(contrastRatio(fg, bg) >= min, `${name}: ${contrastRatio(fg, bg).toFixed(2)} < ${min}`);
});
