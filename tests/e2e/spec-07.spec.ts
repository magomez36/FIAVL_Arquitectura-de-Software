import { expect, test } from '@playwright/test';
import { venueSchema } from '@fiavl/contracts';
import { z } from 'zod';

const venuesSchema = z.array(venueSchema);
const routes = [
  { name: 'Del ensayo a la escena', stops: ['sala-la-trama', 'teatro-del-sur'] },
  { name: 'Sonidos al aire libre', stops: ['casa-del-eco', 'patio-del-rio', 'plaza-del-viento'] }
];

test('selección, orden y fichas reales con teclado en móvil, con Espacios pendiente', async ({ page, request }) => {
  const venues = venuesSchema.parse(await (await request.get('/api/venues')).json());
  await page.route('**/src/features/espacios/index.tsx*', route => route.fulfill({
    contentType: 'application/javascript',
    body: "export default {path:'/espacios',label:'Espacios',available:false,Page:()=>null}"
  }));
  await page.setViewportSize({ width: 375, height: 750 });
  await page.goto('/rutas');
  const select = page.getByLabel('Elegir recorrido');
  const next = page.getByRole('button', { name: 'Siguiente parada' });
  const previous = page.getByRole('button', { name: 'Parada anterior' });
  for (const route of routes) {
    await select.selectOption({ label: route.name });
    await expect(previous).toBeDisabled();
    const stops = route.stops.map(id => {
      const venue = venues.find(v => v.id === id);
      if (!venue) throw new Error('Falta en el seed la sede ' + id);
      return venue;
    });
    await expect(page.getByRole('listitem')).toHaveText(stops.map(v => v.name));
    for (const [i, venue] of stops.entries()) {
      await expect(page.getByRole('heading', { name: venue.name })).toBeVisible();
      for (const field of [venue.description, venue.address, venue.accessibilityNotes]) {
        await expect(page.getByText(field, { exact: true })).toBeVisible();
      }
      await expect(page.locator('article img')).toHaveAttribute('src', venue.image);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (i < stops.length - 1) {
        if (i === 0) {
          await select.focus();
          await page.keyboard.press('Tab');
          await expect(next).toBeFocused();
        }
        await next.press('Enter');
      }
    }
    await expect(next).toBeDisabled();
  }
  await previous.press('Enter');
  await expect(page.getByRole('heading', { name: 'Patio del Río' })).toBeVisible();
});

test('una sede ausente conserva su posición y permite avanzar', async ({ page, request }) => {
  const venues = venuesSchema.parse(await (await request.get('/api/venues')).json());
  await page.route('**/api/venues', route => route.fulfill({ json: venues.filter(v => v.id !== 'patio-del-rio') }));
  await page.goto('/rutas');
  await page.getByLabel('Elegir recorrido').selectOption({ label: routes[1].name });
  const next = page.getByRole('button', { name: 'Siguiente parada' });
  await next.click();
  await expect(page.getByRole('listitem')).toHaveText(['Casa del Eco', 'Sede ausente', 'Plaza del Viento']);
  await expect(page.getByText('Esta sede no figura en el catálogo.')).toBeVisible();
  await expect(page.getByText('Paseo del Río 8')).toHaveCount(0);
  await next.click();
  await expect(page.getByRole('heading', { name: 'Plaza del Viento' })).toBeVisible();
});

test('espera, fallo de red, respuesta inválida, reintento y catálogo vacío', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let attempts = 0;
  await page.route('**/api/venues', async route => {
    await gate;
    attempts++;
    if (attempts === 1) await route.abort();
    else await route.fulfill({ json: attempts === 2 ? [{}] : [] });
  });
  await page.goto('/rutas');
  await expect(page.getByRole('status')).toContainText('Cargando');
  release();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect.poll(() => attempts).toBe(2);
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('status')).toHaveText('Aún no hay sedes en el catálogo.');
});
