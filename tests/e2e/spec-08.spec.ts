import { expect, test, type Page } from '@playwright/test';
import { venueSchema } from '@fiavl/contracts';
import { z } from 'zod';

const EDITORIAL = 8;
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const cards = (page: Page) => page.locator('.galeria-grid > li');
const venuesOf = async (page: Page) =>
  z.array(venueSchema).parse(await (await page.request.get('/api/venues')).json());

test('entrada directa, menú y recarga con sedes reales y aviso académico', async ({ page }) => {
  const venues = await venuesOf(page);
  await page.goto('/galeria');
  await expect(page.getByRole('heading', { level: 1, name: 'Galería' })).toBeVisible();
  await expect(page.getByText('Proyecto académico no oficial')).toBeVisible();
  await expect(cards(page)).toHaveCount(EDITORIAL + venues.length);
  await expect(page).toHaveTitle('Galería · FIAVL Explora');
  await page.reload();
  await expect(cards(page)).toHaveCount(EDITORIAL + venues.length);
  await page.goto('/');
  await page.getByRole('button', { name: 'Menú' }).click();
  const link = page.getByRole('navigation').locator('a[href="/galeria"]');
  await expect(link.getByText('No disponible')).toHaveCount(0);
  await link.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Galería' })).toBeVisible();
  await expect(page.getByText('Función no disponible')).toHaveCount(0);
  // Jerarquía de encabezados h1 > h2 > h3
  await expect(page.getByRole('heading', { level: 2, name: 'Colección' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(EDITORIAL + venues.length);
});

test('las sedes son ilustraciones demo y cada imagen carga con texto alternativo', async ({ page }) => {
  const venues = await venuesOf(page);
  await page.goto('/galeria');
  for (const v of venues) {
    const card = cards(page).filter({ has: page.getByRole('heading', { level: 3, name: v.name, exact: true }) });
    await expect(card).toContainText(v.address);
    await expect(card).toContainText('no es una fotografía de la sede');
    await expect(card.getByRole('img', { name: `Ilustración demo de la sede ${v.name}` })).toBeVisible();
  }
  const imgs = page.locator('.galeria-thumb');
  await expect(imgs).toHaveCount(EDITORIAL + venues.length);
  for (const img of await imgs.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(((await img.getAttribute('alt')) ?? '').length).toBeGreaterThan(10);
    expect(await img.getAttribute('src')).toMatch(/^\/(art|images)\//);
  }
});

test('categorías, contador, vacío de categoría y vuelta a todas', async ({ page }) => {
  const total = EDITORIAL + (await venuesOf(page)).length;
  await page.goto('/galeria');
  const count = page.locator('.galeria-count');
  await expect(count).toContainText(`Mostrando ${total} de ${total} imágenes`);
  const pressed = (name: string) => page.getByRole('button', { name: new RegExp('^' + name) });
  await expect(pressed('Todas')).toHaveAttribute('aria-pressed', 'true');
  await pressed('Ambientación').click();
  await expect(cards(page)).toHaveCount(3);
  await expect(count).toContainText(`Mostrando 3 de ${total} imágenes`);
  await expect(pressed('Ambientación')).toHaveAttribute('aria-pressed', 'true');
  await expect(pressed('Todas')).toHaveAttribute('aria-pressed', 'false');
  await expect(cards(page).first()).toContainText('no documenta una función');
  await pressed('Archivo documental').click();
  await expect(cards(page)).toHaveCount(1);
  const museo = cards(page).first();
  await expect(museo).toContainText('Museo de la Cultura Lojana');
  await expect(museo.getByRole('link', { name: 'CC BY-SA 2.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/2.0/');
  await expect(museo.getByRole('link', { name: 'Flickr' })).toHaveAttribute('href', /flickr\.com\/photos\/diegotirira/);
  await expect(museo).toContainText('Diego Tirira');
  await pressed('Ilustraciones').click();
  await expect(cards(page)).toHaveCount(4);
  await pressed('Sedes').click();
  await expect(cards(page)).toHaveCount(5);
  await pressed('Todas').click();
  await expect(cards(page)).toHaveCount(total);
});

test('ampliación con teclado: diálogo modal, foco, Escape y límites', async ({ page }) => {
  await page.goto('/galeria');
  await page.getByRole('button', { name: 'Ambientación (3)' }).click();
  const open = page.getByRole('button', { name: 'Ampliar: Bailarina bajo un foco' });
  await open.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Bailarina bajo un foco' });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(el => (el as HTMLDialogElement).matches(':modal'))).toBe(true);
  await expect(dialog.getByRole('img', { name: /Bailarina en escena/ })).toBeVisible();
  await expect(dialog).toContainText('Marlon Ribeiro');
  await expect(dialog.getByRole('button', { name: 'Cerrar' })).toBeFocused();
  // Foco confinado: ninguna tecla Tab lo saca del diálogo
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  }
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  }
  // Ciclo: Shift+Tab desde Cerrar va al último control y Tab vuelve a Cerrar
  const close = dialog.getByRole('button', { name: 'Cerrar' });
  await close.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', { name: 'Siguiente' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(open).toBeFocused();
  // Espacio abre, el botón visible cierra y devuelve el foco
  await page.keyboard.press('Space');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.locator('dialog')).toHaveCount(0);
  await expect(open).toBeFocused();
});

test('anterior y siguiente respetan los extremos de los resultados', async ({ page }) => {
  await page.goto('/galeria');
  await page.getByRole('button', { name: 'Ambientación (3)' }).click();
  await cards(page).first().getByRole('button', { name: /^Ampliar/ }).click();
  const dialog = page.getByRole('dialog');
  const prev = dialog.getByRole('button', { name: 'Anterior' });
  const next = dialog.getByRole('button', { name: 'Siguiente' });
  await expect(dialog.getByText('Imagen 1 de 3')).toBeVisible();
  await expect(prev).toBeDisabled();
  await next.click();
  await expect(dialog.getByText('Imagen 2 de 3')).toBeVisible();
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(dialog.getByText('Imagen 3 de 3')).toBeVisible();
  await expect(next).toBeDisabled();
  // El foco no se pierde cuando el botón enfocado se deshabilita
  expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true);
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(false);
  await prev.click();
  await expect(dialog.getByText('Imagen 2 de 3')).toBeVisible();
  const title = await dialog.getByRole('heading', { level: 2 }).innerText();
  await page.keyboard.press('Escape');
  // El foco vuelve al control que abrió la vista (la primera tarjeta)
  await expect(cards(page).first().getByRole('button', { name: /^Ampliar/ })).toBeFocused();
  expect(title.length).toBeGreaterThan(0);
});

test('clic en el fondo cierra y las imágenes no son controles', async ({ page }) => {
  await page.goto('/galeria');
  await expect(page.locator('.galeria-thumb')).not.toHaveCount(0);
  expect(await page.locator('.galeria-thumb').evaluateAll(els => els.every(e => !e.closest('button, a, [role=button]') && !e.hasAttribute('tabindex')))).toBe(true);
  await cards(page).first().getByRole('button', { name: /^Ampliar/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box!.x).toBeGreaterThan(0);
  await page.mouse.click(2, 2);
  await expect(page.locator('dialog')).toHaveCount(0);
});

test('recurso de imagen roto muestra alternativa textual sin bucle de errores', async ({ page }) => {
  let hits = 0;
  await page.route('**/images/danza.webp', route => { hits++; return route.abort(); });
  await page.goto('/galeria');
  await page.getByRole('button', { name: 'Ambientación (3)' }).click();
  const card = cards(page).filter({ has: page.getByRole('heading', { level: 3, name: 'Bailarina bajo un foco' }) });
  await expect(card.getByRole('img', { name: /Imagen no disponible: Bailarina en escena/ })).toBeVisible();
  await expect(card.locator('img')).toHaveCount(0);
  await expect(card).toContainText('Marlon Ribeiro');
  await expect(cards(page)).toHaveCount(3);
  await page.waitForLoadState('networkidle');
  expect(hits).toBe(1);
  await card.getByRole('button', { name: /^Ampliar/ }).click();
  await expect(page.getByRole('dialog').getByRole('img', { name: /Imagen no disponible/ })).toBeVisible();
  expect(hits).toBe(1);
});

test('catálogo de sedes vacío conserva los recursos locales y distingue el estado', async ({ page }) => {
  await page.route('**/api/venues', route => route.fulfill({ json: [] }));
  await page.goto('/galeria');
  await expect(cards(page)).toHaveCount(EDITORIAL);
  await expect(page.getByText('El catálogo no tiene sedes todavía.')).toBeVisible();
  await page.getByRole('button', { name: 'Sedes (0)' }).click();
  await expect(cards(page)).toHaveCount(0);
  await expect(page.getByText('No hay imágenes en esta categoría.')).toBeVisible();
  await page.getByRole('button', { name: 'Ver todas las imágenes' }).click();
  await expect(cards(page)).toHaveCount(EDITORIAL);
  await page.getByRole('button', { name: 'Ambientación (3)' }).click();
  await expect(page.getByText('El catálogo no tiene sedes todavía.')).toHaveCount(0);
});

test('error HTTP: alerta, imágenes locales visibles y reintento', async ({ page }) => {
  let failing = true;
  await page.route('**/api/venues', route => failing
    ? route.fulfill({ status: 500, json: { error: { code: 'BOOM', message: 'caído' } } })
    : route.continue());
  await page.goto('/galeria');
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('No se pudo cargar el catálogo de sedes');
  await expect(cards(page)).toHaveCount(EDITORIAL);
  await page.getByRole('button', { name: 'Sedes' }).click();
  await expect(page.locator('.galeria-count')).toContainText('Las sedes aún no están disponibles.');
  failing = false;
  await alert.getByRole('button', { name: 'Reintentar' }).click();
  await expect(alert).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Sedes (5)' })).toBeVisible();
  await expect(cards(page)).toHaveCount(5);
});

test('contrato inválido: alerta específica y reintento', async ({ page }) => {
  let bad = true;
  await page.route('**/api/venues', route => bad
    ? route.fulfill({ json: [{ id: 'X', name: 3 }] }) : route.continue());
  await page.goto('/galeria');
  await expect(page.getByRole('alert')).toContainText('formato no válido');
  await expect(cards(page)).toHaveCount(EDITORIAL);
  bad = false;
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Sedes (5)' })).toBeVisible();
});

test('respuestas fuera de orden: una respuesta tardía abortada no actualiza ni rompe', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/venues', async route => { await gate; await route.continue().catch(() => undefined); });
  await page.goto('/galeria');
  await expect(page.getByText('Cargando sedes…')).toBeVisible();
  await expect(cards(page)).toHaveCount(EDITORIAL);
  await page.getByRole('link', { name: /FIAVL Explora/ }).first().click();
  await expect(page).toHaveURL(/\/$/);
  release();
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('movimiento reducido desactiva transiciones y animaciones', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/galeria');
  await expect(cards(page).first()).toBeVisible();
  const styles = await page.locator('.galeria .stage-card').first().evaluate(el => {
    const s = getComputedStyle(el); return [s.transitionDuration, s.animationName];
  });
  expect(styles[0]).toMatch(/^0s/);
  expect(styles[1]).toBe('none');
  await cards(page).first().getByRole('button', { name: /^Ampliar/ }).click();
  const dialogStyle = await page.getByRole('dialog').evaluate(el => getComputedStyle(el).animationName);
  expect(dialogStyle).toBe('none');
});

for (const width of [320, 375, 768, 1440]) {
  test(`sin desbordamiento horizontal ni imágenes deformadas a ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 700 ? 800 : 900 });
    await page.goto('/galeria');
    await expect(cards(page).first()).toBeVisible();
    expect(await noOverflow(page)).toBe(true);
    const thumb = page.locator('.galeria-thumb').first();
    await expect.poll(() => thumb.evaluate(el => (el as HTMLImageElement).complete)).toBe(true);
    const box = await thumb.evaluate(el => ({ fit: getComputedStyle(el).objectFit, w: el.clientWidth, h: el.clientHeight }));
    expect(box.fit).toBe('cover');
    expect(box.w).toBeGreaterThan(0);
    await cards(page).first().getByRole('button', { name: /^Ampliar/ }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(await noOverflow(page)).toBe(true);
    const rect = await dialog.evaluate(el => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, w: innerWidth }; });
    expect(rect.l).toBeGreaterThanOrEqual(0);
    expect(rect.r).toBeLessThanOrEqual(rect.w);
  });
}

test('foco visible y contrastante en controles', async ({ page }) => {
  await page.goto('/galeria');
  const chip = page.getByRole('button', { name: /^Todas/ });
  await chip.focus();
  await page.keyboard.press('Tab');
  const outline = await page.getByRole('button', { name: /^Sedes/ }).evaluate(el => {
    const s = getComputedStyle(el); return { width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
  });
  expect(outline).toEqual({ width: '3px', style: 'solid', color: 'rgb(89, 28, 55)' });
  const open = cards(page).first().getByRole('button', { name: /^Ampliar/ });
  await open.focus();
  expect(await open.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
});

test('no hay regresión en otros módulos ni escritura de almacenamiento', async ({ page }) => {
  await page.goto('/galeria');
  await expect(cards(page).first()).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage).filter(k => /galer/i.test(k)))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.className + document.body.className)).not.toMatch(/galeria/);
  for (const [path, heading] of [['/espacios', 'Espacios culturales'], ['/artistas', 'Artistas'], ['/accesibilidad', 'Guía de accesibilidad']] as const) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
});
