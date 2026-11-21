import { expect, test } from '@playwright/test';

for (const width of [375, 1440]) {
  test('escena y destinos a ' + width + ' px', async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'La ciudad abre el telón' })).toBeVisible();
    const carousel = page.getByRole('region', { name: 'Cartel de escenas' });
    const slides = ['#seleccion', '/espacios', '/rutas'];
    for (const [i, href] of slides.entries()) {
      await carousel.getByRole('button', { name: 'Ir a escena ' + (i + 1) }).click();
      await expect(carousel.getByRole('link')).toHaveAttribute('href', href);
      await expect.poll(() => carousel.locator('img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await carousel.getByRole('button', { name: 'Ir a escena 1' }).click();
    await expect(page.locator('article h3')).toHaveCount(3);
    await page.screenshot({ path: info.outputPath('portada-' + width + '.png'), fullPage: true });
  });
}

test('escena automática, pausas, teclado e indicadores', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  const region = page.getByRole('region', { name: 'Cartel de escenas' });
  const active = region.locator('button[aria-current="true"]');
  const expectSlide = (n: number) => expect(active).toHaveAccessibleName('Ir a escena ' + n);
  await expectSlide(1);
  await page.clock.fastForward(7001);
  await expectSlide(2);
  await region.hover();
  await page.clock.fastForward(8000);
  await expectSlide(2);
  await region.getByRole('button', { name: 'Pausar' }).click();
  await page.mouse.move(0, 0);
  await page.getByRole('button', { name: 'Menú' }).focus();
  await page.clock.fastForward(8000);
  await expectSlide(2);
  await region.getByRole('button', { name: 'Reanudar' }).click();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(8000);
  await expectSlide(2);
  await region.getByRole('button', { name: 'Siguiente escena' }).press('Enter');
  await expectSlide(3);
  await region.getByRole('button', { name: 'Escena anterior' }).press('Enter');
  await expectSlide(2);
  await page.getByRole('button', { name: 'Menú' }).focus();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(8000);
  await expectSlide(2);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(7001);
  await expectSlide(3);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(region.getByRole('button', { name: 'Movimiento reducido' })).toBeDisabled();
  await page.clock.fastForward(15000);
  await expectSlide(3);
});

test('encuesta móvil guarda la valoración y recupera el envío fallido', async ({ page, request }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const before = await (await request.get('/api/feedback/summary')).json();
  await page.goto('/opiniones');
  await page.getByRole('radio', { name: '4 estrellas' }).check();
  await page.getByLabel('Comentario opcional').fill('Una experiencia demo');
  await page.route('**/api/feedback', route => route.fulfill({ status: 503 }), { times: 1 });
  const submit = page.getByRole('button', { name: 'Enviar valoración' });
  await submit.press('Enter');
  await expect(page.getByRole('alert')).toBeVisible();
  await submit.press('Enter');
  await expect(page.getByText('Gracias por compartir tu experiencia.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Respuestas recibidas: ' + (before.total + 1))).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('efectos escénicos, gesto táctil y destino de la lámina', async ({ page }) => {
  await page.goto('/');
  const region = page.getByRole('region', { name: 'Cartel de escenas' });
  const light = () => page.locator('.stage-shade').evaluate(el => getComputedStyle(el, '::after').animationName);
  expect(await light()).toBe('stage-light');
  const card = page.locator('.stage-card').first();
  await card.hover();
  await expect.poll(() => card.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(light).toBe('none');
  await expect.poll(() => card.evaluate(el => getComputedStyle(el).transform)).toBe('none');
  const surface = region.locator('h1');
  await surface.evaluate(el => {
    const start = new Touch({ identifier: 1, target: el, clientX: 220, clientY: 80 });
    const end = new Touch({ identifier: 1, target: el, clientX: 100, clientY: 85 });
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [start] }));
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [end] }));
  });
  await region.getByRole('link', { name: 'Descubrir espacios' }).click();
  await expect(page.getByRole('heading', { name: 'Espacios culturales' })).toBeVisible();
});

test('intervalo en tiempo real y reproducción reducida', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const region = page.getByRole('region', { name: 'Cartel de escenas' });
  const active = region.locator('[aria-current="true"]');
  await page.mouse.move(1, 1);
  await expect(region.getByText('Autoavance · 7 s')).toBeVisible();
  const started = Date.now();
  await expect(active).toHaveAccessibleName('Ir a escena 2', { timeout: 9000 });
  const elapsed = Date.now() - started;
  console.log('Cambio automático observado en ' + elapsed + ' ms');
  expect(elapsed).toBeGreaterThan(6100);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(region.getByRole('button', { name: 'Movimiento reducido' })).toBeDisabled();
  await page.waitForTimeout(7200);
  await expect(active).toHaveAccessibleName('Ir a escena 2');
});

for (const width of [375, 1440]) {
  test('guía documentada, navegación e interiores a ' + width, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('link', { name: 'Guía FIAVL 2026', exact: true }).first().click();
    await expect(page).toHaveURL(/#guia-festival$/);
    const guide = page.getByRole('region', { name: 'Funciones del FIAVL 2026' });
    for (const title of ['Técnicos', 'Monàs', 'Monólogo La Escoba', 'Nada era un misterio']) {
      await expect(guide.getByRole('link', { name: new RegExp(title, 'i') })).toHaveAttribute('href', /^https:\/\/(festivaldeloja\.com|cultura\.ec)\//);
    }
    await expect(page.getByText('Cartelera del prototipo', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Ver las cinco sedes' }).click();
    const venues = page.getByRole('region', { name: 'Sedes del FIAVL 2026' });
    await expect(venues.getByRole('link', { name: /Teatro Benjamín Carrión Mora/ })).toBeVisible();
    await expect(venues.getByRole('link', { name: /Museo de Loja/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Directorio demo' })).toBeVisible();
    for (const slug of ['espacios', 'rutas', 'opiniones']) {
      await page.goto('/' + slug);
      await expect(page.getByText('Prototipo académico no oficial · Datos demo', { exact: true }).first()).toBeVisible();
      if (slug === 'rutas') await page.getByRole('button', { name: 'Siguiente parada' }).click();
      if (slug === 'opiniones') await page.getByRole('radio', { name: '4 estrellas' }).check();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await page.screenshot({ path: info.outputPath(slug + '-' + width + '.png'), fullPage: true });
    }
  });
}

test('programa registrado y alternativa de archivo sin conexión a la fotografía', async ({ page }) => {
  await page.route('**/images/museo-loja.jpg', route => route.abort());
  await page.goto('/');
  const guide = page.getByRole('region', { name: 'Funciones del FIAVL 2026' });
  const records = [
    ['Técnicos', 'tecnicos', '20', '20:00', 'Teatro Benjamín Carrión Mora', 'Colectivo Independiente Técnicos de Cuenca'],
    ['Monàs', 'monas-la-verdadera-esencia-de-las-cosas', '21', '11:00 y 18:00', 'Centro Cultural Alfredo Mora Reyes', 'Teatringestazione'],
    ['Monólogo La Escoba', 'monologo-de-la-escoba', '21', '18:00', 'Teatro Bolívar', 'Juana Estrella'],
    ['Nada era un misterio', 'nada-era-un-misterio-el-enigmatico-caso-manana', '22', '11:00 y 19:00', 'Teatro Benjamín Carrión Mora', 'La Mona Ilustre']
  ];
  for (const [title, slug, day, hours, venue, artist] of records) {
    const row = guide.getByRole('listitem').filter({ hasText: title }).first();
    await expect(row.getByRole('link')).toHaveAttribute('href', 'https://cultura.ec/evento/' + slug);
    for (const value of [day, hours, venue, artist]) await expect(row).toContainText(value);
  }
  await expect(page.getByText('Fotografía de archivo del Museo de Loja. Consulta el original enlazado.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Diego Tirira' })).toHaveAttribute('href', /flickr\.com/);
});
