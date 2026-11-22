import { expect, test } from '@playwright/test';
import { eventsSchema } from '@fiavl/contracts';

test('agenda real: orden, filtros combinables, detalle y limpieza en móvil', async ({ page, request }) => {
  await page.setViewportSize({ width: 375, height: 750 });
  const events = eventsSchema.parse(await (await request.get('/api/events')).json());
  await page.goto('/agenda');
  await expect(page.getByRole('main').getByText('Prototipo académico no oficial · Datos demo')).toBeVisible();
  await expect(page.locator('.agenda-list > li')).toHaveCount(events.length);
  expect(await page.locator('.agenda-list time').evaluateAll(t => t.map(x => x.getAttribute('datetime'))))
    .toEqual(events.map(e => e.startAt));
  await page.getByLabel('Precio').selectOption('free');
  await expect(page.locator('.agenda-list > li')).toHaveCount(events.filter(e => e.priceCents === 0).length);
  await page.getByLabel('Buscar').fill('sin coincidencias zzz');
  await expect(page.getByText('No hay eventos que coincidan con los filtros.')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page.locator('.agenda-list > li')).toHaveCount(events.length);
  await page.locator('.agenda-list button').first().click();
  await expect(page.locator('.agenda-detail')).toContainText('Artistas');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('agenda: carga, error con reintento y vacío', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/events', route => ++attempts === 1
    ? route.fulfill({ status: 500, json: { error: { code: 'INTERNAL_ERROR', message: 'Error de lectura.' } } })
    : route.fulfill({ json: [] }));
  await page.goto('/agenda');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByText('No hay eventos que coincidan con los filtros.')).toBeVisible();
});
