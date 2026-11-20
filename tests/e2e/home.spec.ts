import { expect, test, type Page } from '@playwright/test';

test('portada real, proxy SQLite y selección por teclado', async ({ page, request }) => {
  await page.clock.setFixedTime(new Date('2031-01-01T00:00:00Z'));
  expect(await (await request.get('/api/health')).json()).toEqual({ status: 'ok' });
  const events = await (await request.get('/api/events')).json();
  expect(events).toHaveLength(12);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('Prototipo no oficial', { exact: false }).first()).toBeVisible();
  await expect(page.locator('article')).toHaveCount(3);
  await expect(page.locator('article h3').first()).toHaveText(events[0].title);
  await page.keyboard.press('Tab');
  await expect(page.getByText('Saltar al contenido')).toBeFocused();
  const link = page.getByRole('link', { name: 'Ver selección' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#seleccion$/);
  for (const img of await page.locator('img').all()) {
    await expect.poll(() => img.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
});

const featurePaths = ['/agenda', '/artistas', '/espacios', '/mi-agenda', '/reservas',
  '/rutas', '/galeria', '/accesibilidad', '/opiniones'];

async function visitFeature(page: Page, path: string) {
  await page.getByRole('button', { name: 'Menú' }).click();
  const link = page.getByRole('navigation').locator(`a[href="${path}"]`);
  await expect(link).toBeVisible();
  const label = (await link.innerText()).replace('No disponible', '').trim();
  const pending = await link.getByText('No disponible', { exact: true }).isVisible();
  await link.click();
  await expect(page).toHaveURL(new URL(path, page.url()).href);
  await expect(page).toHaveTitle(label + ' · FIAVL Explora');
  const main = page.getByRole('main');
  await expect(main).toBeFocused();
  const placeholder = main.getByText('Función no disponible', { exact: true });
  await expect(main).toContainText(/\S/, { useInnerText: true });
  await expect(main.getByRole('heading', { name: 'Página no encontrada' })).toHaveCount(0);
  if (pending) {
    await expect(placeholder).toBeVisible();
    await expect(main.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  } else {
    await expect(placeholder).toHaveCount(0);
  }
  return pending;
}

test('menú y nueve rutas en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 750 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menú' });
  await menu.click();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  for (const path of featurePaths) {
    const pending = await visitFeature(page, path);
    // Una entrada directa también debe resolver la página tras recargar Vite.
    await page.reload();
    await expect(page.getByRole('main')).toContainText(/\S/, { useInnerText: true });
    await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toHaveCount(0);
    await expect(page.getByText('Función no disponible', { exact: true })).toHaveCount(pending ? 1 : 0);
    if (pending) {
      await page.getByRole('link', { name: 'Volver al inicio' }).click();
      await expect(page).toHaveURL(new URL('/', page.url()).href);
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('el shell acepta entradas activas independientes en el mismo menú', async ({ page }) => {
  // Solo este navegador recibe dos módulos de prueba en lugar de las entradas Vite.
  for (const [slug, label] of [['mi-agenda', 'Mi agenda'], ['reservas', 'Reservas']]) {
    const entry = { path: '/' + slug, label, available: true };
    await page.route(`**/src/features/${slug}/index.tsx*`, route => route.fulfill({
      contentType: 'application/javascript',
      body: `export default { ...${JSON.stringify(entry)}, Page: () => ${JSON.stringify('Vista de prueba · ' + label)} };`
    }));
  }
  await page.goto('/');
  for (const path of featurePaths) {
    const pending = await visitFeature(page, path);
    if (path === '/mi-agenda' || path === '/reservas') {
      expect(pending).toBe(false);
      await expect(page.getByRole('main')).toContainText('Vista de prueba ·');
    }
  }
});

test('espera, error recuperable y catálogo vacío', async ({ page }) => {
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  let attempts = 0;
  await page.route('**/api/events', async route => {
    if (++attempts === 1) {
      await wait;
      await route.fulfill({ status: 500, json: { error: { code: 'INTERNAL_ERROR', message: 'Error de lectura.' } } });
    } else await route.fulfill({ json: [] });
  });
  await page.goto('/');
  await expect(page.getByText('Cargando programación…')).toBeVisible();
  release();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByText('Aún no hay eventos en la programación.')).toBeVisible();
});
