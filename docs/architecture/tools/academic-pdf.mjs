import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [markedModule, playwrightModule] = process.argv.slice(2);
if (!markedModule || !playwrightModule) {
  throw new Error('Uso: node academic-pdf.mjs <marked/lib/marked.esm.js> <playwright/index.mjs>');
}

const { marked } = await import(pathToFileURL(resolve(markedModule)).href);
const { chromium } = await import(pathToFileURL(resolve(playwrightModule)).href);
const folder = fileURLToPath(new URL('../academico/', import.meta.url));
const name = 'FIAVL_Arquitectura_4plus1';
const markdown = await readFile(resolve(folder, name + '.md'), 'utf8');
const imagePattern = /(!\[[^\]]+\]\()(\.\.\/rendered\/png\/[A-Z]+-\d{2}\.png)\)/g;
const resources = new Map();
for (const [, , path] of markdown.matchAll(imagePattern)) {
  if (resources.has(path)) throw new Error('Figura repetida: ' + path);
  resources.set(path, 'data:image/png;base64,' + (await readFile(resolve(folder, path))).toString('base64'));
}
if (resources.size !== 33) throw new Error('El Markdown debe contener 33 figuras');
const content = markdown.replace(imagePattern, (_, open, path) => open + resources.get(path) + ')');

const css = `
  @page {
    size: A4;
    margin: 16mm;
    @bottom-center { content: counter(page); color: black; font: 9pt Arial; }
  }
  @page a4l { size: A4 landscape; }
  @page a3p { size: A3 portrait; }
  @page a3l { size: A3 landscape; }
  @page a2p { size: 420mm 594mm; }
  @page a2l { size: 594mm 420mm; }
  html { color: black; background: white; font: 11pt/1.35 Arial, sans-serif; }
  body { margin: 0; }
  h1, h2, h3 { color: black; line-height: 1.18; break-after: avoid; }
  h1 { font-size: 23pt; margin: 0 0 8mm; }
  h2 { font-size: 16pt; margin: 7mm 0 3mm; }
  h3 { font-size: 12.5pt; margin: 4mm 0 2.5mm; }
  p { margin: 0 0 3mm; orphans: 3; widows: 3; }
  ul, ol { margin: 0 0 4mm; padding-left: 7mm; }
  li { margin-bottom: 1mm; }
  a { color: black; text-decoration: underline; }
  code { color: black; overflow-wrap: anywhere; }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; margin: 3mm 0 5mm; }
  th, td { border: .5pt solid black; text-align: left; vertical-align: top; padding: 1.4mm 2mm; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  .cover { padding-top: 22mm; break-after: page; }
  .cover h2 { font-size: 17pt; margin: 0 0 10mm; }
  .cover p { line-height: 1.65; }
  .figure { display: flow-root; break-inside: avoid; margin: 0 0 4mm; }
  .figure img { display: block; height: auto; max-width: 100%; margin: 3mm auto 0; }
  .a4l { page: a4l; }
  .a3p { page: a3p; }
  .a3l { page: a3l; }
  .a2p { page: a2p; }
  .a2l { page: a2l; }
`;

const github = 'https://github.com/magomez36/FIAVL_Arquitectura-de-Software/blob/docs/architecture-4plus1/docs/architecture/academico/';
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 2300, height: 1100 } });
  await page.route('**/*', route => route.abort());
  const html = await marked.parse(content);
  await page.setContent('<!doctype html><html lang="es"><meta charset="utf-8"><title>FIAVL Explora - Arquitectura 4+1</title><style>' +
    css + '</style><body>' + html + '</body></html>', { waitUntil: 'load' });
  const figures = await page.evaluate(async github => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode()));
    const slug = title => title.toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').replace(/ /g, '-');
    for (const heading of document.querySelectorAll('h2, h3')) heading.id = slug(heading.textContent);
    for (const anchor of document.querySelectorAll('a[href]')) {
      const path = anchor.getAttribute('href');
      if (path.startsWith('../')) anchor.href = new URL(path, github).href;
    }
    const toc = document.getElementById('índice');
    const cover = document.createElement('section');
    cover.className = 'cover';
    while (document.body.firstElementChild !== toc) cover.append(document.body.firstElementChild);
    document.body.prepend(cover);

    const sizes = [
      ['', 210, 297], ['a4l', 297, 210],
      ['a3p', 297, 420], ['a3l', 420, 297],
      ['a2p', 420, 594], ['a2l', 594, 420]
    ];
    const mm = 96 / 25.4;
    const margin = 16;
    const result = [];
    for (const heading of [...document.querySelectorAll('h3')]) {
      const match = heading.textContent.match(/^(\d+\.\d+)\. ([A-Z]+-\d{2}) · /);
      if (!match) continue;
      const [, , code] = match;
      const description = heading.nextElementSibling;
      const container = description?.nextElementSibling;
      const image = container?.querySelector('img');
      if (!image?.naturalWidth || !image.alt.startsWith(code + ' · ')) {
        throw new Error('Figura o pie incoherente: ' + code);
      }
      const figure = document.createElement('section');
      figure.className = 'figure';
      heading.before(figure);
      figure.append(heading, description, image);
      container.remove();

      const intro = [];
      let previous = figure.previousElementSibling;
      while (previous?.matches('p, ul')) {
        intro.unshift(previous);
        previous = previous.previousElementSibling;
      }
      if (previous?.matches('h2') && /^[4-8]\. /.test(previous.textContent)) {
        figure.prepend(previous, ...intro);
      }

      // Los PNG representan dos píxeles de imagen por píxel CSS del diagrama.
      const nativeWidth = image.naturalWidth / 2;
      const nativeHeight = image.naturalHeight / 2;
      image.style.display = 'none';
      const options = sizes.map(([style, width, height]) => {
        const printableWidth = (width - 2 * margin) * mm;
        figure.style.width = printableWidth + 'px';
        const printableHeight = (height - 2 * margin) * mm;
        const freeHeight = printableHeight - figure.getBoundingClientRect().height - 24;
        const scale = Math.min(printableWidth / nativeWidth, freeHeight / nativeHeight, 1);
        return { style, scale };
      });
      // A4 es la primera opción. Los formatos mayores preservan la legibilidad de las láminas densas.
      const layout = options.find(option => option.scale >= 0.74) ??
        options.reduce((largest, option) => option.scale > largest.scale ? option : largest);
      if (layout.scale < 0.70) throw new Error('La figura requiere más espacio: ' + code);
      figure.style.removeProperty('width');
      if (layout.style) figure.classList.add(layout.style);
      image.style.removeProperty('display');
      image.style.width = Math.floor(nativeWidth * layout.scale) + 'px';
      result.push([code, layout.style || 'a4p', layout.scale.toFixed(2)]);
    }
    return result;
  }, github);
  if (figures.length !== resources.size) throw new Error('Faltan figuras en la versión para impresión');
  await page.pdf({ path: resolve(folder, name + '.pdf'), printBackground: true, preferCSSPageSize: true, tagged: true });
  for (const figure of figures) console.log(figure.join('\t'));
} finally {
  await browser.close();
}
