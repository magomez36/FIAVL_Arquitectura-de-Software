import { expect, test } from '@playwright/test';
import { eventsSchema } from '@fiavl/contracts';

test('directorio real, búsqueda, ficha y eventos en móvil con teclado', async ({ page, request }) => {
  await page.setViewportSize({ width: 375, height: 750 });
  const events = eventsSchema.parse(await (await request.get('/api/events')).json());
  const expected = events.filter(e => e.venueId === 'teatro-del-sur');
  expect(expected.length).toBeGreaterThan(0);
  await page.goto('/espacios');
  await expect(page.locator('summary')).toHaveCount(5);
  const search = page.getByRole('searchbox');
  await search.fill('sin coincidencias');
  await expect(page.getByText('Ninguna sede coincide con la búsqueda.')).toBeVisible();
  await search.fill('teatro del sur');
  await expect(page.locator('summary')).toHaveCount(1);
  await search.fill('Telón');
  await search.press('Tab');
  const summary = page.locator('summary');
  await expect(summary).toBeFocused();
  await expect(summary).toHaveText('Teatro del Sur');
  await summary.press('Enter');
  await expect(page.getByText('Calle del Telón 12', { exact: true })).toBeVisible();
  await expect(page.getByText('Sala de caja negra con graderío cercano al escenario.')).toBeVisible();
  await expect(page.getByText('Entrada a nivel y dos espacios para silla de ruedas.')).toBeVisible();
  await expect(page.locator('details img')).toHaveAttribute('src', '/art/teatro.svg');
  await expect.poll(() => page.locator('details img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('details li strong')).toHaveText(expected.map(e => e.title));
  expect(await page.locator('details time').evaluateAll(times => times.map(t => t.getAttribute('datetime'))))
    .toEqual(expected.map(e => e.startAt));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await search.fill('');
  await expect(page.locator('summary')).toHaveCount(5);
});

test('una sede sin eventos conserva su ficha', async ({ page }) => {
  await page.route('**/api/events', route => route.fulfill({ json: [] }));
  await page.goto('/espacios');
  await page.locator('summary').first().click();
  await expect(page.locator('details[open]')).toContainText('Esta sede aún no tiene eventos.');
});

test('carga, respuesta inválida, reintento y directorio vacío', async ({ page }) => {
  let release!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  let retry = false;
  await page.route('**/api/venues', async route => {
    await waiting;
    await route.fulfill({ json: retry ? [] : [{}] });
  });
  await page.goto('/espacios');
  await expect(page.getByRole('status')).toContainText('Cargando');
  release();
  await expect(page.getByRole('alert')).toBeVisible();
  retry = true;
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByText('Aún no hay sedes en el directorio.')).toBeVisible();
});
