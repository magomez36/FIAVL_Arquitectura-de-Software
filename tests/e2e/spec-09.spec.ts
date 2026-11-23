import { expect, test, type Page } from '@playwright/test';
import { venueSchema } from '@fiavl/contracts';
import { z } from 'zod';

const KEY = 'fiavl:accessibility:v1';
const guide = (page: Page) => page.locator('.a11y-guide');
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

test('sedes reales de la API con aviso demo, sin inventar capacidades', async ({ page, request }) => {
  const venues = z.array(venueSchema).parse(await (await request.get('/api/venues')).json());
  await page.goto('/accesibilidad');
  await expect(page.getByRole('heading', { level: 1, name: 'Guía de accesibilidad' })).toBeVisible();
  await expect(page.getByText('no son certificaciones oficiales')).toBeVisible();
  await expect(page.getByText('confirma sus condiciones reales')).toBeVisible();
  const cards = page.locator('.a11y-grid > li');
  await expect(cards).toHaveCount(venues.length);
  for (const v of venues) {
    const card = page.locator('.a11y-grid > li').filter({ has: page.getByRole('heading', { name: v.name, exact: true }) });
    await expect(card).toContainText(v.address);
    await expect(card).toContainText(v.accessibilityNotes);
  }
});

test('búsqueda con tildes, mayúsculas, espacios y sin coincidencias', async ({ page }) => {
  await page.goto('/accesibilidad');
  const search = page.getByLabel('Buscar por nombre, dirección o notas de acceso');
  await search.fill('  TELON  ');
  await expect(page.locator('.a11y-grid > li')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Teatro del Sur', level: 3 })).toBeVisible();
  await search.fill('silla de ruedas');
  await expect(page.locator('.a11y-grid > li')).toHaveCount(1);
  await search.fill('zzzz');
  await expect(page.getByText('Ninguna sede coincide con la búsqueda.')).toBeVisible();
  await search.fill('');
  await expect(page.locator('.a11y-grid > li')).toHaveCount(5);
});

test('texto y contraste se aplican, persisten tras recargar y se restablecen', async ({ page }) => {
  await page.goto('/accesibilidad');
  const root = guide(page);
  const size = () => root.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  const base = await size();
  await expect(root).toHaveAttribute('data-contrast', 'standard');
  await page.getByLabel('Extra grande').check();
  await expect.poll(size).toBeGreaterThan(base * 1.4);
  await page.getByLabel('Elevado').check();
  await expect(root).toHaveAttribute('data-contrast', 'high');
  expect(await root.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(15, 9, 20)');
  await expect(page.getByTestId('a11y-current')).toContainText('extra grande');
  await expect(page.getByTestId('a11y-current')).toContainText('elevado');
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), KEY)).toEqual({ version: 1, textSize: 'xlarge', contrast: 'high' });
  // Sin efecto global
  expect(await page.evaluate(() => document.documentElement.className + document.body.className)).not.toMatch(/a11y|contrast|large/);
  await page.reload();
  await expect(guide(page)).toHaveAttribute('data-text-size', 'xlarge');
  await expect(guide(page)).toHaveAttribute('data-contrast', 'high');
  await expect(page.getByText('Preferencias restauradas')).toBeVisible();
  await page.getByRole('button', { name: 'Restablecer preferencias' }).click();
  await expect(guide(page)).toHaveAttribute('data-text-size', 'normal');
  await expect(guide(page)).toHaveAttribute('data-contrast', 'standard');
  await expect(page.getByRole('button', { name: 'Restablecer preferencias' })).toBeDisabled();
});

test('almacenamiento corrupto: valores predeterminados y aviso', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, '{"version":1,"textSize":"enorme"}'), KEY);
  await page.goto('/accesibilidad');
  await expect(guide(page)).toHaveAttribute('data-text-size', 'normal');
  await expect(page.getByText('no eran válidas')).toBeVisible();
  await expect(page.locator('.a11y-grid > li')).toHaveCount(5);
});

test('almacenamiento bloqueado: se aplica, avisa y no lanza errores', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('bloqueado', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('bloqueado', 'SecurityError'); };
  });
  await page.goto('/accesibilidad');
  await page.getByLabel('Grande', { exact: true }).check();
  await expect(guide(page)).toHaveAttribute('data-text-size', 'large');
  await expect(page.getByRole('alert')).toContainText('No se pudieron guardar');
  expect(errors).toEqual([]);
});

test('carga, respuesta inválida con reintento y catálogo vacío', async ({ page }) => {
  let release!: () => void;
  const waiting = new Promise<void>(r => { release = r; });
  let retry = false;
  await page.route('**/api/venues', async route => {
    await waiting;
    await route.fulfill({ json: retry ? [] : [{}] });
  });
  await page.goto('/accesibilidad');
  await expect(page.getByText('Cargando sedes…')).toBeVisible();
  release();
  await expect(page.getByRole('alert').filter({ hasText: 'No se pudo cargar' })).toBeVisible();
  retry = true;
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByText('Aún no hay sedes en el catálogo.')).toBeVisible();
  // Las preferencias siguen operativas aunque el catálogo falle
  await page.getByLabel('Elevado').check();
  await expect(guide(page)).toHaveAttribute('data-contrast', 'high');
});

test('teclado: radios, restablecer y foco visible en ambos contrastes', async ({ page }) => {
  await page.goto('/accesibilidad');
  const radio = page.getByLabel('Grande', { exact: true });
  await radio.focus();
  await page.keyboard.press('ArrowRight');
  await expect(guide(page)).toHaveAttribute('data-text-size', 'xlarge');
  for (const contrast of ['standard', 'high']) {
    await page.getByLabel(contrast === 'high' ? 'Elevado' : 'Estándar').check();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    const outline = await page.locator(':focus-visible').first().evaluate(el => {
      const s = getComputedStyle(el); return { w: parseFloat(s.outlineWidth), style: s.outlineStyle, color: s.outlineColor };
    });
    expect(outline.style).toBe('solid');
    expect(outline.w).toBeGreaterThanOrEqual(3);
    if (contrast === 'high') expect(outline.color).toBe('rgb(255, 210, 122)');
  }
  const search = page.getByRole('searchbox');
  await search.focus();
  await expect(search).toBeFocused();
  expect(await search.evaluate(el => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(3);
});

for (const width of [375, 1440]) {
  test(`sin desbordamiento horizontal a ${width} px con texto extra grande y contraste elevado`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/accesibilidad');
    await page.getByLabel('Extra grande').check();
    await page.getByLabel('Elevado').check();
    await expect(page.locator('.a11y-grid > li')).toHaveCount(5);
    expect(await noOverflow(page)).toBe(true);
  });
}

test('movimiento reducido: sin animaciones ni transiciones en la guía', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/accesibilidad');
  const card = page.locator('.a11y-guide .stage-card').first();
  await expect(card).toBeVisible();
  expect(await card.evaluate(el => getComputedStyle(el).transitionDuration)).toMatch(/^0s/);
});
