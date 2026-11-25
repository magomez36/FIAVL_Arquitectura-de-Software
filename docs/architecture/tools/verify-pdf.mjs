import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [modules, previewDir] = process.argv.slice(2);
if (!modules || !previewDir) {
  throw new Error('Uso: node verify-pdf.mjs <node_modules temporal con pdfjs-dist> <carpeta de previsualización>');
}
const pdfjs = await import(pathToFileURL(resolve(modules, 'pdfjs-dist/legacy/build/pdf.mjs')).href);
const { createCanvas } = await import(pathToFileURL(resolve(modules, '@napi-rs/canvas/index.js')).href);
const docs = fileURLToPath(new URL('../', import.meta.url));
const data = new Uint8Array(await readFile(join(docs, 'academico/FIAVL_Arquitectura_4plus1.pdf')));
const expected = (await readdir(join(docs, 'diagrams'))).filter(name => name.endsWith('.mmd')).map(name => name.slice(0, -4)).sort();
const figureIds = new Set(expected);
const observed = [];
const pages = [];
const pdf = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
await mkdir(previewDir, { recursive: true });

for (let index = 1; index <= pdf.numPages; index++) {
  const page = await pdf.getPage(index);
  const content = await page.getTextContent();
  const words = content.items.filter(item => 'str' in item && item.str.trim());
  assert(words.length > 4, `Página vacía o incompleta: ${index}`);
  const heading = words.find(item => item.height >= 15 && figureIds.has(item.str.split(/\s/, 1)[0]));
  const code = heading?.str.split(/\s/, 1)[0];
  if (code) observed.push(code);

  const viewport = page.getViewport({ scale: 0.9 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext('2d');
  await page.render({ canvas, canvasContext: context, viewport }).promise;

  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  let bounds = [canvas.width, canvas.height, 0, 0];
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (Math.min(image.data[i], image.data[i + 1], image.data[i + 2]) >= 238) continue;
      bounds = [Math.min(x, bounds[0]), Math.min(y, bounds[1]), Math.max(x, bounds[2]), Math.max(y, bounds[3])];
    }
  }
  assert(bounds[0] > 7 && bounds[1] > 7 && canvas.width - bounds[2] > 7 && canvas.height - bounds[3] > 7,
    `Contenido demasiado cerca del borde, página ${index}: ${bounds}`);
  const scale = Math.min(180 / canvas.width, 230 / canvas.height);
  const thumb = createCanvas(Math.ceil(canvas.width * scale), Math.ceil(canvas.height * scale));
  thumb.getContext('2d').drawImage(canvas, 0, 0, thumb.width, thumb.height);
  pages.push({ thumb, label: String(index) + (code ? ' · ' + code : '') });
  if ([1, 2].includes(index) || ['DES-01', 'DES-02', 'ESC-01', 'LOG-01', 'CU-12', 'ACTV-02', 'TEC-01'].includes(code)) {
    await writeFile(join(previewDir, 'page-' + String(index).padStart(2, '0') + '.png'), canvas.toBuffer('image/png'));
  }
}

assert.deepEqual(observed.sort(), expected, 'El PDF debe contener una página con cada figura');
for (let start = 0; start < pages.length; start += 12) {
  const group = pages.slice(start, start + 12);
  const sheet = createCanvas(800, Math.ceil(group.length / 4) * 268);
  const context = sheet.getContext('2d');
  context.fillStyle = '#e7dfe8';
  context.fillRect(0, 0, sheet.width, sheet.height);
  context.font = '14px Arial';
  group.forEach(({ thumb, label }, i) => {
    const x = (i % 4) * 200 + 10;
    const y = Math.floor(i / 4) * 268 + 10;
    context.fillStyle = '#302237';
    context.fillText(label, x, y + 14);
    context.drawImage(thumb, x, y + 23);
  });
  await writeFile(join(previewDir, 'contact-' + String(start / 12 + 1) + '.png'), sheet.toBuffer('image/png'));
}
console.log(`${pdf.numPages} páginas rasterizadas y ${observed.length} figuras identificadas. Márgenes comprobados.`);
await pdf.destroy();
