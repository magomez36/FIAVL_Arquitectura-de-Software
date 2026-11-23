import { expect, test } from '@playwright/test';

const KEY = 'fiavl:agenda:v1';

test('mi agenda: añadir, duplicado, solapamiento, recarga y quitar (entrada directa, 375 px)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 750 });
  await page.goto('/mi-agenda');
  await expect(page.getByText('Tu agenda está vacía.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'programación cultural' })).toHaveAttribute('href', '/agenda');
  await page.getByRole('button', { name: 'Agregar: Umbral de luz' }).click();
  await expect(page.getByRole('button', { name: 'Ya está en tu agenda: Umbral de luz' })).toBeDisabled();
  await page.getByRole('button', { name: 'Agregar: El río suena' }).click();
  const mine = page.getByRole('list', { name: 'Eventos de mi agenda' });
  await expect(mine.getByRole('listitem')).toHaveCount(2);
  await expect(mine.getByText('Se solapa con: El río suena.')).toBeVisible();
  await expect(mine.getByText('Se solapa con: Umbral de luz.')).toBeVisible();
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), KEY)).toEqual(['umbral-de-luz', 'el-rio-suena']);
  await page.reload();
  await expect(mine.getByRole('listitem')).toHaveCount(2);
  await mine.getByRole('button', { name: 'Quitar: El río suena' }).click();
  await expect(mine.getByRole('listitem')).toHaveCount(1);
  await expect(mine.getByText('Se solapa')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('mi agenda: ID inexistente y almacenamiento corrupto', async ({ page }) => {
  await page.addInitScript(k => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem(k, JSON.stringify(['umbral-de-luz', 'ya-no-existe'])); } }, KEY);
  await page.goto('/mi-agenda');
  await expect(page.getByText('1 evento guardado ya no existe en el catálogo demo.')).toBeVisible();
  await page.getByRole('button', { name: 'Quitar los que no existen' }).click();
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)!), KEY)).toEqual(['umbral-de-luz']);
  await page.evaluate(k => localStorage.setItem(k, '{no es json'), KEY);
  await page.reload();
  await expect(page.getByText('Tu agenda está vacía.')).toBeVisible();
});

test('mi agenda: almacenamiento bloqueado avisa del guardado fallido', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('bloqueado'); }; });
  await page.goto('/mi-agenda');
  await page.getByRole('button', { name: 'Agregar: Umbral de luz' }).click();
  await expect(page.getByRole('alert')).toContainText('No se pudo guardar tu agenda');
  await expect(page.getByRole('list', { name: 'Eventos de mi agenda' }).getByRole('listitem')).toHaveCount(1);
});

test('mi agenda: error con reintento y escritorio a 1440 px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let n = 0;
  await page.route('**/api/events', r => ++n === 1 ? r.fulfill({ status: 500, json: { error: { code: 'INTERNAL_ERROR', message: 'x' } } }) : r.continue());
  await page.goto('/mi-agenda');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('heading', { name: 'Agregar eventos' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
