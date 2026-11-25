import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [modules, previewDir, contactDir = previewDir] = process.argv.slice(2);
if (!modules || !previewDir) {
  throw new Error('Uso: node verify-pdf.mjs <node_modules con pdfjs-dist> <carpeta temporal> [carpeta de hojas de contacto]');
}
const pdfjs = await import(pathToFileURL(resolve(modules, 'pdfjs-dist/legacy/build/pdf.mjs')).href);
const { createCanvas, loadImage } = await import(pathToFileURL(resolve(modules, '@napi-rs/canvas/index.js')).href);
const docs = fileURLToPath(new URL('../', import.meta.url));
const stem = join(docs, 'academico/FIAVL_Arquitectura_4plus1');
const markdown = await readFile(stem + '.md', 'utf8');
const expected = [...markdown.matchAll(/^!\[([A-Z]+-\d{2}) · [^\]]+\]\(\.\.\/rendered\/png\/\1\.png\)$/gm)]
  .map(([, id]) => id);
const originals = (await readdir(join(docs, 'diagrams'))).filter(name => name.endsWith('.mmd')).map(name => name.slice(0, -4));
assert.equal(expected.length, 33);
assert.deepEqual([...expected].sort(), originals.sort(), 'El inventario Markdown debe coincidir con los originales');

function imageRegions(operators, viewport) {
  let ctm = [1, 0, 0, 1, 0, 0];
  const stack = [];
  const images = [];
  const { OPS, Util } = pdfjs;
  for (let i = 0; i < operators.fnArray.length; i++) {
    const operator = operators.fnArray[i];
    if (operator === OPS.save) stack.push(ctm);
    else if (operator === OPS.restore) ctm = stack.pop();
    else if (operator === OPS.transform) ctm = Util.transform(ctm, operators.argsArray[i]);
    else if (operator === OPS.paintImageXObject || operator === OPS.paintInlineImageXObject) {
      const [x0, y0, x1, y1] = viewport.convertToViewportRectangle([ctm[4], ctm[5], ctm[4] + ctm[0], ctm[5] + ctm[3]]);
      assert(Math.abs(ctm[1]) + Math.abs(ctm[2]) < 0.01, 'Rotación de imagen no esperada');
      images.push({
        left: Math.min(x0, x1), top: Math.min(y0, y1), width: Math.abs(x1 - x0), height: Math.abs(y1 - y0),
        object: operator === OPS.paintImageXObject ? operators.argsArray[i][0] : null
      });
    }
  }
  return images.sort((a, b) => a.top - b.top || a.left - b.left);
}

function downsample(image, rect, width, height) {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, rect.left, rect.top, rect.width, rect.height, 0, 0, width, height);
  return context.getImageData(0, 0, width, height).data;
}

function verifyEmbedded(reference, embedded, id) {
  assert.equal(embedded.width, reference.width, 'Ancho de imagen incrustada: ' + id);
  assert.equal(embedded.height, reference.height, 'Alto de imagen incrustada: ' + id);
  assert.equal(embedded.kind, pdfjs.ImageKind.RGB_24BPP, 'Formato de imagen incrustada: ' + id);
  const original = downsample(reference, { left: 0, top: 0, width: reference.width, height: reference.height },
    reference.width, reference.height);
  const copied = embedded.data;
  let matches = true;
  for (let i = 0, j = 0; i < original.length; i += 4, j += 3) {
    if (original[i + 3] !== 255 || original[i] !== copied[j] ||
        original[i + 1] !== copied[j + 1] || original[i + 2] !== copied[j + 2]) {
      matches = false;
      break;
    }
  }
  assert(matches, 'Píxeles de la imagen incrustada distintos del PNG: ' + id);
}

function localInk(pixels, x, y, width, height) {
  let sum = 0;
  for (let dy = -2; dy <= 2; dy++) {
    const row = Math.min(height - 1, Math.max(0, y + dy));
    for (let dx = -2; dx <= 2; dx++) {
      const col = Math.min(width - 1, Math.max(0, x + dx));
      sum += 255 - pixels[(row * width + col) * 4];
    }
  }
  return sum / 25;
}

function compareFigure(reference, rendered, rect, id) {
  assert(Math.abs(reference.width / reference.height - rect.width / rect.height) < 0.005, 'Proporción alterada: ' + id);
  const scale = Math.min(460 / rect.width, 780 / rect.height, 1);
  const width = Math.round(rect.width * scale);
  const height = Math.round(rect.height * scale);
  const source = downsample(reference, { left: 0, top: 0, width: reference.width, height: reference.height }, width, height);
  const actual = downsample(rendered, rect, width, height);
  const bands = Array.from({ length: 8 }, () => ({ source: 0, total: 0, shared: 0 }));
  let monochrome = true;
  for (let i = 0; i < source.length; i += 4) {
    const x = i / 4 % width;
    const y = Math.floor(i / 4 / width);
    const band = bands[Math.floor(y * bands.length / height)];
    const a = localInk(source, x, y, width, height);
    const b = localInk(actual, x, y, width, height);
    band.source += a;
    band.total += Math.max(a, b);
    band.shared += Math.min(a, b);
    if (source[i] !== source[i + 1] || source[i] !== source[i + 2] ||
        actual[i] !== actual[i + 1] || actual[i] !== actual[i + 2]) monochrome = false;
  }
  assert(monochrome, 'Colores no neutros: ' + id);
  const ink = bands.reduce((n, band) => n + band.source, 0);
  assert(ink > width * height, 'Figura de origen vacía: ' + id);
  const score = bands.reduce((n, band) => n + band.shared, 0) / bands.reduce((n, band) => n + band.total, 0);
  // El PDF y el PNG se rasterizan a distintas resoluciones. Se compara la distribución de tinta
  // en cada franja para detectar pérdida de extremos, recortes y superposiciones.
  const detail = bands.filter(band => band.source > ink / 100)
    .map(band => band.shared / band.total);
  assert(score >= 0.74 && Math.min(...detail) >= 0.64,
    id + ' difiere del PNG. Global ' + score.toFixed(3) + ', franjas ' + detail.map(x => x.toFixed(3)).join(', '));
  return score;
}

function sheet(items, { columns, width, height }) {
  const canvas = createCanvas(columns * (width + 20), Math.ceil(items.length / columns) * (height + 34));
  const context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.font = '15px Arial';
  items.forEach(({ asset, label }, i) => {
    const x = i % columns * (width + 20) + 10;
    const y = Math.floor(i / columns) * (height + 34) + 8;
    const scale = Math.min(width / asset.width, height / asset.height, 1);
    context.fillStyle = 'black';
    context.fillText(label, x, y + 15);
    context.drawImage(asset, x, y + 22, asset.width * scale, asset.height * scale);
  });
  return canvas;
}

const data = new Uint8Array(await readFile(stem + '.pdf'));
const pdf = await pdfjs.getDocument({
  data, useSystemFonts: true, isOffscreenCanvasSupported: false, isImageDecoderSupported: false
}).promise;
await mkdir(previewDir, { recursive: true });
await mkdir(contactDir, { recursive: true });
const pages = [];
const crops = [];
const records = [];
try {
  for (let index = 1; index <= pdf.numPages; index++) {
    const page = await pdf.getPage(index);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext('2d');
    const [text, operators] = await Promise.all([page.getTextContent(), page.getOperatorList()]);
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    const items = text.items.filter(item => item.str?.trim());
    assert(items.length > 2, 'Página sin contenido: ' + index);
    assert(items.some(item => item.str.trim() === String(index) && item.transform[5] < 45), 'Falta numeración: ' + index);
    const titles = items.flatMap(item => {
      const match = item.str.match(/^\d+\.\d+\.\s+([A-Z]+-\d{2})\s+·/);
      return match ? [{ id: match[1], top: viewport.convertToViewportPoint(item.transform[4], item.transform[5])[1] }] : [];
    }).sort((a, b) => a.top - b.top);
    const regions = imageRegions(operators, viewport);
    assert.equal(regions.length, titles.length, 'Cantidad de imágenes frente a títulos en página ' + index);
    for (let i = 0; i < regions.length; i++) {
      const { id, top } = titles[i];
      const rect = regions[i];
      const pad = 15;
      assert(rect.left > pad && rect.top > top && rect.left + rect.width < canvas.width - pad &&
        rect.top + rect.height < (titles[i + 1]?.top ?? canvas.height - pad),
      'Figura recortada o superpuesta: ' + id);
      const reference = await loadImage(join(docs, 'rendered/png', id + '.png'));
      assert(rect.object, 'Falta objeto de imagen completo: ' + id);
      const embedded = await new Promise(ready => page.objs.get(rect.object, ready));
      verifyEmbedded(reference, embedded, id);
      const similarity = compareFigure(reference, canvas, rect, id);
      records.push({ id, page: index, similarity: Number(similarity.toFixed(4)) });
      const crop = createCanvas(Math.ceil(rect.width), Math.ceil(rect.height));
      crop.getContext('2d').drawImage(canvas, rect.left, rect.top, rect.width, rect.height, 0, 0, crop.width, crop.height);
      const file = join(previewDir, id + '.png');
      await writeFile(file, crop.toBuffer('image/png'));
      crops.push({ file, label: id + ' · p. ' + index });
    }
    const file = join(previewDir, 'pagina-' + String(index).padStart(2, '0') + '.png');
    await writeFile(file, canvas.toBuffer('image/png'));
    pages.push({ file, label: 'Página ' + index + (titles.length ? ' · ' + titles.map(({ id }) => id).join(', ') : '') });
    page.cleanup();
  }
  assert.deepEqual(records.map(({ id }) => id), expected, 'El orden del PDF debe coincidir con el Markdown');
  async function writeSheets(items, count, layout, directory, prefix) {
    for (let start = 0; start < items.length; start += count) {
      const group = await Promise.all(items.slice(start, start + count).map(async ({ file, label }) => ({
        asset: await loadImage(file), label
      })));
      const canvas = sheet(group, layout);
      await writeFile(join(directory, prefix + '-' + (start / count + 1) + '.png'), canvas.toBuffer('image/png'));
    }
  }
  await writeSheets(pages, 9, { columns: 3, width: 245, height: 315 }, contactDir, 'contacto');
  await writeSheets(crops, 4, { columns: 2, width: 590, height: 1000 }, previewDir, 'figuras');
  await writeFile(join(previewDir, 'inventario-pdf.json'), JSON.stringify({ pages: pdf.numPages, figures: records }, null, 2) + '\n');
  console.log(pdf.numPages + ' páginas rasterizadas. ' + records.length + ' imágenes incorporadas y cotejadas con los PNG.');
  for (const { id, page, similarity } of records) console.log([id, page, similarity].join('\t'));
} finally {
  await pdf.destroy();
}
