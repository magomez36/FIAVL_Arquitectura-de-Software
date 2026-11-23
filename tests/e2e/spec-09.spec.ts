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

const reset = (page: Page) => page.getByRole('button', { name: 'Restablecer preferencias' });

test('H1/H2: restablecer repara datos corruptos, guarda el objeto válido y retira el aviso', async ({ page }) => {
  await page.addInitScript(k => localStorage.setItem(k, '{"version":1,"textSize":"enorme"}'), KEY);
  await page.goto('/accesibilidad');
  await expect(page.getByText('no eran válidas')).toBeVisible();
  await expect(reset(page)).toBeEnabled();
  await reset(page).click();
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), KEY)).toEqual({ version: 1, textSize: 'normal', contrast: 'standard' });
  await expect(page.getByText('no eran válidas')).toHaveCount(0);
  await expect(reset(page)).toBeDisabled();
  await expect(page.getByRole('status').filter({ hasText: 'restablecidas' })).toBeVisible();
});

test('H1: el aviso de corrupción se mantiene hasta una escritura válida', async ({ page }) => {
  await page.addInitScript(k => {
    if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem(k, '{"version":1,"textSize":"enorme"}'); }
  }, KEY);
  await page.goto('/accesibilidad');
  await expect(page.getByText('no eran válidas')).toBeVisible();
  await page.getByLabel('Elevado').check();
  await expect(page.getByText('no eran válidas')).toHaveCount(0);
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), KEY)).toEqual({ version: 1, textSize: 'normal', contrast: 'high' });
  await page.reload();
  await expect(page.getByText('no eran válidas')).toHaveCount(0);
  await expect(page.getByText('Preferencias restauradas')).toBeVisible();
});

test('H2: con datos corruptos y escritura bloqueada, restablecer avisa y conserva el aviso de corrupción', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(k => {
    const get = Storage.prototype.getItem;
    localStorage.setItem(k, '{"version":1,"textSize":"enorme"}');
    Storage.prototype.getItem = function (key: string) { return key === k ? '{"version":1,"textSize":"enorme"}' : get.call(this, key); };
    Storage.prototype.setItem = () => { throw new DOMException('bloqueado', 'SecurityError'); };
  }, KEY);
  await page.goto('/accesibilidad');
  await expect(reset(page)).toBeEnabled();
  await reset(page).click();
  await expect(page.getByRole('alert')).toContainText('No se pudieron guardar');
  await expect(page.getByText('no eran válidas')).toBeVisible();
  await expect(reset(page)).toBeEnabled();
  expect(errors).toEqual([]);
});

test('H2: sin nada que reparar, restablecer permanece deshabilitado y es distinguible', async ({ page }) => {
  await page.goto('/accesibilidad');
  await expect(reset(page)).toBeDisabled();
  const style = (el: Element) => { const s = getComputedStyle(el); return { op: s.opacity, border: s.borderTopStyle, bg: s.backgroundColor, fg: s.color }; };
  const off = await reset(page).evaluate(style);
  expect(off.border).toBe('dashed');
  expect(off.op).toBe('1');
  await page.getByLabel('Grande', { exact: true }).check();
  const on = await reset(page).evaluate(style);
  expect(on.border).toBe('solid');
  expect(on.bg).not.toBe(off.bg);
});

for (const width of [375, 1440]) {
  test(`H3: el título escala con el tamaño elegido y no desborda a ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/accesibilidad');
    const h1 = page.getByRole('heading', { level: 1 });
    const size = () => h1.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    const sizes: number[] = [];
    for (const label of ['Normal', 'Grande', 'Extra grande']) {
      await page.getByLabel(label, { exact: true }).first().check();
      await expect.poll(size).not.toBe(sizes.at(-1) ?? 0);
      sizes.push(await size());
      expect(await noOverflow(page)).toBe(true);
      expect(await h1.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
    expect(sizes[1]).toBeGreaterThan(sizes[0]!);
    expect(sizes[2]).toBeGreaterThan(sizes[1]!);
    await page.getByLabel('Elevado').check();
    expect(await noOverflow(page)).toBe(true);
  });
}

test('H4: botón deshabilitado legible en contraste estándar y elevado; html y body intactos', async ({ page }) => {
  await page.goto('/accesibilidad');
  const ratio = (el: Element) => {
    const lum = (rgb: string) => {
      const [r, g, b] = rgb.match(/\d+/g)!.map(n => { const c = Number(n) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const s = getComputedStyle(el);
    const [hi, lo] = [lum(s.color), lum(s.backgroundColor)].sort((a, b) => b - a);
    return (hi! + 0.05) / (lo! + 0.05);
  };
  expect(await reset(page).evaluate(ratio)).toBeGreaterThanOrEqual(4.5);
  await page.getByLabel('Elevado').check();
  await reset(page).evaluate(el => el.setAttribute('disabled', ''));
  expect(await reset(page).evaluate(ratio)).toBeGreaterThanOrEqual(4.5);
  expect(await page.evaluate(() => [document.documentElement.className, document.body.className, document.documentElement.style.cssText, document.body.style.cssText].join(''))).toBe('');
  const rootSize = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  await page.getByLabel('Extra grande').check();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe(rootSize);
  await page.goto('/espacios');
  await expect(page.locator('.a11y-guide')).toHaveCount(0);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe(rootSize);
});
