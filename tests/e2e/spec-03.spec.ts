import { expect, test } from '@playwright/test';
import { artistSchema } from '@fiavl/contracts';
import { z } from 'zod';

test('artistas: catálogo, búsqueda, filtros combinados, limpieza y sin desbordar en móvil', async ({ page, request }) => {
  await page.setViewportSize({ width: 375, height: 750 });
  const artists = z.array(artistSchema).parse(await (await request.get('/api/artists')).json());
  await page.goto('/artistas');
  await expect(page.getByRole('heading', { level: 1, name: 'Artistas' })).toBeVisible();
  await expect(page.getByRole('main').getByText('Prototipo académico no oficial · Datos demo')).toBeVisible();
  const cards = page.locator('.artistas-list > li');
  await expect(cards).toHaveCount(artists.length);
  const first = artists[0];
  await expect(cards.first()).toContainText(first.name);
  await expect(cards.first()).toContainText(first.country);
  await expect(cards.first()).toContainText(first.discipline);
  await expect(cards.first()).toContainText(first.bio);
  await expect(cards.first().locator('img')).toHaveAttribute('src', first.image);

  await page.getByLabel('Buscar por nombre').fill('ines');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText('Inés Luz');
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(cards).toHaveCount(artists.length);

  await page.getByLabel('País').selectOption('Ecuador');
  await page.getByLabel('Disciplina').selectOption('Música');
  const expected = artists.filter(a => a.country === 'Ecuador' && a.discipline === 'Música');
  await expect(cards).toHaveCount(expected.length);
  await expect(page.getByRole('status').filter({ hasText: /artistas?$/ })).toHaveText(`${expected.length} artistas`);
  await page.getByLabel('Buscar por nombre').fill('zzz');
  await expect(page.getByText('No hay artistas que coincidan con los filtros.')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(cards).toHaveCount(artists.length);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('artistas: detalle con actuaciones por artistIds, hora de Loja y artista sin actuaciones', async ({ page }) => {
  await page.goto('/artistas');
  const umbral = page.locator('.artistas-list > li', { hasText: 'Colectivo Umbral' });
  const toggle = umbral.getByRole('button', { name: /detalle/ });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const detail = umbral.locator('.artistas-detail');
  await expect(detail).toContainText('Investiga el movimiento de grupos en espacios cotidianos.');
  const show = detail.locator('li', { hasText: 'Umbral de luz' });
  await expect(show).toContainText('12 de noviembre');
  await expect(show).toContainText('18:00');
  await expect(show).toContainText('Teatro del Sur');
  await expect(show.locator('time')).toHaveAttribute('datetime', '2026-11-12T18:00:00-05:00');

  // Artista sin actuaciones: se simula quitando sus eventos de la respuesta (el catálogo real no cambia).
  await page.route('**/api/events', async route => {
    const events = await (await route.fetch()).json() as { artistIds: string[] }[];
    await route.fulfill({ json: events.map(e => ({ ...e, artistIds: e.artistIds.filter(id => id !== 'colectivo-umbral') })) });
  });
  await page.reload();
  const again = page.locator('.artistas-list > li', { hasText: 'Colectivo Umbral' });
  await again.getByRole('button', { name: /detalle/ }).click();
  await expect(again).toContainText('Este artista no tiene actuaciones programadas.');
});

test('artistas: carga, error con reintento y vacío', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/artists', route => ++attempts === 1
    ? route.fulfill({ status: 500, json: { error: { code: 'INTERNAL_ERROR', message: 'Error de lectura.' } } })
    : route.fulfill({ json: [] }));
  await page.goto('/artistas');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByText('Aún no hay artistas en el catálogo.')).toBeVisible();
});

test('artistas: muestra estado de carga mientras espera la API', async ({ page }) => {
  await page.route('**/api/venues', async route => { await new Promise(r => setTimeout(r, 400)); await route.continue(); });
  await page.goto('/artistas');
  await expect(page.getByText('Cargando artistas…')).toBeVisible();
  await expect(page.locator('.artistas-list > li').first()).toBeVisible();
});

test('artistas: es independiente de /agenda y el menú no la marca como pendiente', async ({ page }) => {
  await page.goto('/artistas');
  await expect(page.locator('.artistas-list > li').first()).toBeVisible();
  await page.goto('/');
  await page.getByRole('button', { name: 'Menú' }).click();
  const link = page.getByRole('navigation').locator('a[href="/artistas"]');
  await expect(link).toBeVisible();
  await expect(link).not.toContainText('No disponible');
  await link.click();
  await expect(page).toHaveURL(/\/artistas$/);
  await expect(page.getByText('Función no disponible')).toHaveCount(0);
});
