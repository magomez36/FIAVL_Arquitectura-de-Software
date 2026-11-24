import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import type { Venue } from '@fiavl/contracts';
import {
  CATEGORIES, buildItems, categoryCounts, editorialItems, filterItems, isLocalSrc, neighbour, selectionIn
} from '../apps/web/src/features/galeria/logic.ts';

const venue = (id: string, name: string, image = '/art/teatro.svg'): Venue =>
  ({ id, name, address: 'Calle ' + name, description: 'd', accessibilityNotes: 'n', image });
const venues = [venue('patio-del-rio', 'Patio del Río'), venue('casa-del-eco', 'Casa del Eco'), venue('teatro-del-sur', 'Teatro del Sur')];

test('categorías declaradas: Todas y cuatro categorías con etiqueta', () => {
  assert.deepEqual(CATEGORIES.map(c => c.id), ['todas', 'sedes', 'ambientacion', 'ilustraciones', 'archivo']);
  assert.ok(CATEGORIES.every(c => c.label.length > 0));
});

test('orden determinista: categoría, luego título y id; no depende del orden de entrada', () => {
  const a = buildItems(venues).map(i => i.id);
  const b = buildItems([...venues].reverse()).map(i => i.id);
  assert.deepEqual(a, b);
  const sedes = buildItems(venues).filter(i => i.category === 'sedes').map(i => i.title);
  assert.deepEqual(sedes, ['Casa del Eco', 'Patio del Río', 'Teatro del Sur']);
  const order = buildItems(venues).map(i => i.category);
  const ranks = order.map(c => CATEGORIES.findIndex(x => x.id === c));
  assert.deepEqual(ranks, [...ranks].sort((x, y) => x - y));
});

test('identificadores únicos y estables; las sedes compartiendo ilustración no se confunden', () => {
  const items = buildItems(venues);
  assert.equal(new Set(items.map(i => i.id)).size, items.length);
  assert.deepEqual(buildItems(venues).map(i => i.id), items.map(i => i.id));
  const sedes = items.filter(i => i.category === 'sedes');
  assert.equal(new Set(sedes.map(i => i.src)).size, 1);
  assert.deepEqual(sedes.map(i => i.id), ['sede-casa-del-eco', 'sede-patio-del-rio', 'sede-teatro-del-sur']);
});

test('las sedes se presentan como ilustración demo, nunca como fotografía de la sede', () => {
  for (const item of buildItems(venues).filter(i => i.category === 'sedes')) {
    assert.match(item.alt, /^Ilustración demo/);
    assert.match(item.caption, /no es una fotografía/);
    assert.equal(item.credit.kind, 'prototype');
  }
});

test('sin sedes quedan solo los recursos editoriales y ninguno se pierde', () => {
  const items = buildItems([]);
  assert.equal(items.length, editorialItems.length);
  assert.ok(items.length >= 8);
  assert.equal(items.filter(i => i.category === 'sedes').length, 0);
});

test('filtros y contadores coinciden con el inventario', () => {
  const items = buildItems(venues);
  assert.equal(filterItems(items, 'todas').length, items.length);
  assert.equal(filterItems(items, 'sedes').length, 3);
  assert.equal(filterItems(items, 'ambientacion').length, 3);
  assert.equal(filterItems(items, 'archivo').length, 1);
  const counts = categoryCounts(items);
  assert.equal(counts.todas, items.length);
  assert.equal(counts.sedes + counts.ambientacion + counts.ilustraciones + counts.archivo, items.length);
});

test('procedencia: cada fotografía tiene autoría, fuente y licencia; el museo solo CC BY-SA 2.0', () => {
  for (const item of editorialItems.filter(i => i.category === 'ambientacion' || i.category === 'archivo')) {
    assert.equal(item.credit.kind, 'photo', item.id);
    if (item.credit.kind !== 'photo') continue;
    assert.ok(item.credit.author && item.credit.licence && item.credit.sourceUrl.startsWith('https://'), item.id);
  }
  const museo = editorialItems.filter(i => i.src.includes('museo-loja'));
  assert.equal(museo.length, 1);
  assert.equal(museo[0]?.category, 'archivo');
  assert.match(museo[0]?.title ?? '', /Museo de la Cultura Lojana/);
  if (museo[0]?.credit.kind === 'photo') {
    assert.equal(museo[0].credit.author, 'Diego Tirira');
    assert.match(museo[0].credit.licence, /CC BY-SA 2\.0/);
  }
  for (const item of editorialItems.filter(i => i.category === 'ambientacion')) {
    assert.match(item.caption, /Ambientación/);
    assert.match(item.caption, /no documenta una función/);
  }
});

test('todas las imágenes son locales y existen en public', () => {
  for (const item of buildItems(venues)) {
    assert.ok(isLocalSrc(item.src), item.src);
    assert.ok(existsSync(new URL('../apps/web/public' + item.src, import.meta.url)), item.src);
  }
  assert.equal(isLocalSrc('https://example.com/a.jpg'), false);
  assert.equal(isLocalSrc('//example.com/a.jpg'), false);
  assert.equal(isLocalSrc('/art/../x.svg'), false);
  assert.equal(isLocalSrc('data:image/png;base64,AA'), false);
});

test('textos alternativos presentes y distintos entre sí', () => {
  const items = buildItems(venues);
  assert.ok(items.every(i => i.alt.trim().length > 10));
  assert.equal(new Set(items.map(i => i.alt)).size, items.length);
});

test('vecinos: límites sin ciclo y selección que desaparece', () => {
  const results = filterItems(buildItems(venues), 'sedes');
  const [a, b, c] = results.map(i => i.id) as [string, string, string];
  assert.equal(neighbour(results, a, -1), undefined);
  assert.equal(neighbour(results, a, 1)?.id, b);
  assert.equal(neighbour(results, c, 1), undefined);
  assert.equal(neighbour(results, c, -1)?.id, b);
  assert.equal(neighbour(results, 'inexistente', 1), undefined);
  assert.equal(selectionIn(results, b)?.id, b);
  assert.equal(selectionIn(results, 'telon'), undefined);
  assert.equal(selectionIn(results, undefined), undefined);
});

test('la entrada está activada y no añade dependencias, hotlinks ni almacenamiento', () => {
  const dir = '../apps/web/src/features/galeria/';
  const index = readFileSync(new URL(dir + 'index.tsx', import.meta.url), 'utf8');
  assert.match(index, /available: true/);
  for (const file of ['index.tsx', 'logic.ts']) {
    const src = readFileSync(new URL(dir + file, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /https?:\/\/[^'"`\s]*\.(jpe?g|png|webp|svg)/i, file);
    assert.doesNotMatch(src, /localStorage|sessionStorage|readLocal|writeLocal|dangerouslySetInnerHTML/, file);
  }
});
