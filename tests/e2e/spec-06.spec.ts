import { expect, test, type Page } from '@playwright/test';

/** Cada prueba usa un evento distinto o devuelve el aforo, porque el servidor E2E es compartido y persiste durante la ejecución. */
const remaining = async (page: Page, eventId: string) =>
  (await (await page.request.get('/api/reservations/availability/' + eventId)).json()).remaining as number;
const card = (page: Page, title: string) => page.locator('.reservas-list > li', { hasText: title });

async function reserve(page: Page, label: string, quantity: string) {
  await page.getByLabel('Evento').selectOption({ label });
  await page.getByLabel('Cantidad de plazas').fill(quantity);
  await page.getByRole('button', { name: 'Reservar', exact: true }).click();
}

test('reservas: crear, ver plazas restantes, cancelar y volver a abrir con la referencia guardada', async ({ page }) => {
  await page.goto('/reservas');
  await expect(page.getByRole('heading', { level: 1, name: 'Reservas' })).toBeVisible();
  await expect(page.getByRole('main').getByText('Prototipo académico no oficial · Datos demo')).toBeVisible();
  await expect(page.getByRole('main').getByText('Reserva demostrativa; no equivale a una entrada oficial').first()).toBeVisible();
  await expect(page.locator('.reservas-list > li')).toHaveCount(7);
  await expect(page.getByLabel('Evento').locator('option')).toHaveCount(8);
  await expect(page.getByRole('option', { name: /El río suena/ })).toHaveCount(0);
  await expect(card(page, 'Hilos de agua')).toContainText('40 plazas disponibles');

  await reserve(page, 'Hilos de agua · 40 plazas', '3');
  const confirmation = page.getByRole('heading', { name: 'Reserva demostrativa creada' });
  await expect(confirmation).toBeFocused();
  const reference = (await page.locator('.reservas-confirmation .reservas-ref').innerText()).trim();
  expect(reference).toMatch(/^[A-Za-z0-9_-]{32}$/);
  await expect(card(page, 'Hilos de agua')).toContainText('37 plazas disponibles');
  expect(await remaining(page, 'hilos-de-agua')).toBe(37);

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('fiavl:reservations:v1')!));
  expect(stored).toEqual({ version: 1, items: [{ reference, eventId: 'hilos-de-agua', quantity: 3 }] });

  await page.reload();
  const mine = page.locator('.reservas-mine > li');
  await expect(mine).toHaveCount(1);
  await expect(mine.first()).toContainText('Activa');
  await mine.first().getByRole('button', { name: /Cancelar reserva/ }).click();
  await expect(page.getByRole('status').filter({ hasText: 'cancelada' })).toContainText('Hilos de agua');
  await expect(mine.first()).toContainText('Cancelada');
  await expect(card(page, 'Hilos de agua')).toContainText('40 plazas disponibles');
  expect(await remaining(page, 'hilos-de-agua')).toBe(40);
  await mine.first().getByRole('button', { name: /Quitar de la lista/ }).click();
  await expect(page.getByText('No hay reservas guardadas en este navegador.')).toBeVisible();
});

test('reservas: errores de entrada anunciados, aforo agotado y cancelación por referencia', async ({ page }) => {
  await page.goto('/reservas');
  await page.getByRole('button', { name: 'Reservar', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Elige un evento para reservar.');
  await page.getByLabel('Evento').selectOption({ label: 'Mapa sonoro · 2 plazas' });
  for (const [value, message] of [['0', 'La cantidad mínima es 1.'], ['1.5', /entera positiva/], ['', /entera positiva/], ['3', 'Solo quedan 2 plazas.']] as const) {
    await page.getByLabel('Cantidad de plazas').fill(value);
    await page.getByRole('button', { name: 'Reservar', exact: true }).click();
    await expect(page.getByRole('alert')).toHaveText(message);
  }
  expect(await remaining(page, 'mapa-sonoro')).toBe(2);

  await reserve(page, 'Mapa sonoro · 2 plazas', '2');
  const reference = (await page.locator('.reservas-confirmation .reservas-ref').innerText()).trim();
  await expect(card(page, 'Mapa sonoro')).toContainText('Aforo agotado');
  await expect(page.getByRole('option', { name: 'Mapa sonoro · Aforo agotado' })).toBeDisabled();

  // Otra persona solo puede cancelar si conoce la referencia completa.
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText('No hay reservas guardadas en este navegador.')).toBeVisible();
  const manual = page.getByLabel('Cancelar con una referencia');
  const send = page.getByRole('button', { name: 'Cancelar con referencia' });
  await send.click();
  await expect(page.getByRole('alert')).toHaveText('Escribe la referencia de la reserva.');
  await manual.fill('1');
  await send.click();
  await expect(page.getByRole('alert')).toHaveText('La referencia no tiene el formato correcto.');
  await manual.fill('A'.repeat(32));
  await send.click();
  await expect(page.getByRole('alert')).toHaveText('No existe una reserva con esa referencia.');
  expect(await remaining(page, 'mapa-sonoro')).toBe(0);
  await manual.fill(reference);
  await send.click();
  await expect(page.getByRole('status').filter({ hasText: 'cancelada' })).toBeVisible();
  await expect(card(page, 'Mapa sonoro')).toContainText('2 plazas disponibles');
  expect(await remaining(page, 'mapa-sonoro')).toBe(2);
});

test('reservas: sobreventa por otra sesión muestra el error del servidor y actualiza las plazas', async ({ page }) => {
  await page.goto('/reservas');
  await page.getByLabel('Evento').selectOption({ label: 'Umbral de luz · 3 plazas' });
  await page.getByLabel('Cantidad de plazas').fill('2');
  // Otra persona toma 2 plazas después de que esta página cargó la disponibilidad.
  const other = await page.request.post('/api/reservations', { data: { eventId: 'umbral-de-luz', quantity: 2 } });
  expect(other.status()).toBe(201);
  const { reference } = await other.json();
  await page.getByRole('button', { name: 'Reservar', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Solo queda 1 plaza disponible.');
  await expect(card(page, 'Umbral de luz')).toContainText('1 plaza disponible');
  expect((await page.request.post(`/api/reservations/${reference}/cancel`)).status()).toBe(200);
});

test('reservas: carga, error con reintento, vacío y sin eventos reservables', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/reservations/availability', async route => {
    if (++attempts === 1) {
      await new Promise(r => setTimeout(r, 300));
      await route.fulfill({ status: 500, json: { error: { code: 'INTERNAL_ERROR', message: 'Error de lectura.' } } });
    } else await route.continue();
  });
  await page.goto('/reservas');
  await expect(page.getByText('Cargando disponibilidad…')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('No se pudo cargar la disponibilidad de reservas.');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.locator('.reservas-list > li').first()).toBeVisible();

  await page.route('**/api/events', route => route.fulfill({ json: [] }));
  await page.reload();
  await expect(page.getByText('Aún no hay eventos con reserva disponible.')).toBeVisible();
});

test('reservas: almacenamiento corrupto o bloqueado no impide reservar ni avisa en falso', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('fiavl:reservations:v1', '{corrupto'));
  await page.goto('/reservas');
  await expect(page.getByText('No hay reservas guardadas en este navegador.')).toBeVisible();

  const blocked = await page.context().newPage();
  await blocked.addInitScript(() => {
    const deny = () => { throw new DOMException('bloqueado', 'SecurityError'); };
    Object.defineProperty(window, 'localStorage', { get: deny });
  });
  await blocked.goto('/reservas');
  await expect(blocked.getByText('No hay reservas guardadas en este navegador.')).toBeVisible();
  await reserve(blocked, 'Objetos en fuga · 20 plazas', '1');
  await expect(blocked.getByRole('heading', { name: 'Reserva demostrativa creada' })).toBeVisible();
  await expect(blocked.getByRole('alert').filter({ hasText: 'no permite guardar' })).toBeVisible();
  const reference = (await blocked.locator('.reservas-confirmation .reservas-ref').innerText()).trim();
  await blocked.getByLabel('Cancelar con una referencia').fill(reference);
  await blocked.getByRole('button', { name: 'Cancelar con referencia' }).click();
  await expect(blocked.getByRole('heading', { name: 'Reserva cancelada' })).toBeVisible();
  expect(await remaining(blocked, 'objetos-en-fuga')).toBe(20);
});

test('reservas: teclado completo y sin desbordamiento a 375 y 1440 px', async ({ page }) => {
  for (const [width, height] of [[375, 750], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/reservas');
    await expect(page.locator('.reservas-list > li').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/reservas');
  const select = page.getByLabel('Evento');
  await select.focus();
  await page.keyboard.press('ArrowDown');
  await expect(select).not.toHaveValue('');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Cantidad de plazas')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Reservar', exact: true })).toBeFocused();
  const outline = await page.getByRole('button', { name: 'Reservar', exact: true }).evaluate(el => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');
  const value = await select.inputValue();
  await page.getByLabel('Cantidad de plazas').fill('1');
  await page.getByLabel('Cantidad de plazas').press('Enter');
  await expect(page.getByRole('heading', { name: 'Reserva demostrativa creada' })).toBeFocused();
  const reference = (await page.locator('.reservas-confirmation .reservas-ref').innerText()).trim();
  const cancel = page.locator('.reservas-mine').getByRole('button', { name: /Cancelar reserva/ });
  await cancel.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Reserva cancelada' })).toBeVisible();
  expect((await (await page.request.get('/api/reservations/' + reference)).json()).status).toBe('cancelled');
  expect(value).not.toBe('');
});

test('reservas: movimiento reducido, menú activo e independencia de /agenda', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menú' }).click();
  const link = page.getByRole('navigation').locator('a[href="/reservas"]');
  await expect(link).not.toContainText('No disponible');
  await link.click();
  await expect(page).toHaveURL(/\/reservas$/);
  await expect(page.getByText('Función no disponible')).toHaveCount(0);
  await expect(page).toHaveTitle('Reservas · FIAVL Explora');
  expect(await page.locator('.reservas-panel').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});
