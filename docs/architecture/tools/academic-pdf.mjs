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
const paper = 'FIAVL_Arquitectura_4plus1';
const source = await readFile(resolve(folder, paper + '.md'), 'utf8');
const pieces = [...source.matchAll(/\.\.\/rendered\/svg\/[A-Z]+-\d{2}\.svg/g)];
const embedded = new Map();
for (const [path] of pieces) {
  let svg = await readFile(resolve(folder, path), 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/);
  if (!viewBox) throw new Error('SVG sin viewBox: ' + path);
  const [, , width, height] = viewBox[1].split(/\s+/).map(Number);
  svg = svg.replace(/^<svg([^>]+)>/, (_, attributes) =>
    '<svg' + attributes.replace(/\s(?:width|height)="[^"]*"/g, '') + ` width="${width}" height="${height}">`);
  embedded.set(path, 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'));
}

const pictures = source.replace(/(!\[[^\]]+\]\()(\.\.\/rendered\/svg\/[A-Z]+-\d{2}\.svg)\)/g,
  (_, open, path) => open + embedded.get(path) + ')');

const css = `
  @page {
    size: A4;
    margin: 17mm 16mm 16mm;
    @bottom-left { content: "FIAVL Explora  /  Arquitectura 4+1"; color: #695b6a; font: 9pt Arial; }
    @bottom-right { content: counter(page); color: #591C37; font: 9pt Arial; }
  }
  @page a4p { size: A4 portrait; }
  @page a4l { size: A4 landscape; }
  @page a3p { size: A3 portrait; }
  @page a3l { size: A3 landscape; }
  @page a2p { size: 420mm 594mm; }
  @page a2l { size: 594mm 420mm; }
  :root { color: #302237; font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.43; }
  body { margin: 0; }
  h1, h2, h3 { color: #591C37; line-height: 1.16; break-after: avoid; }
  h1 { font: bold 44pt Georgia, serif; margin: 0 0 .3em; }
  h2 { font: bold 23pt Georgia, serif; margin: 1em 0 .4em; }
  h3 { font-size: 17pt; margin: 0 0 .45em; }
  a { color: #591C37; text-decoration: underline; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 1em 0; }
  th, td { border-bottom: 1px solid #E5D8C6; text-align: left; padding: .45em .55em; }
  thead { display: table-header-group; background: #F5EDE0; }
  tr { break-inside: avoid; }
  .cover { border-top: 3mm solid #591C37; padding: 40mm 0 0; min-height: 210mm; break-after: page; }
  .cover h2 { font-size: 28pt; margin: 0 0 1.8em; max-width: 140mm; }
  .cover p { padding-left: 6mm; border-left: 1.5mm solid #E2B567; }
  .cover code { overflow-wrap: anywhere; }
  .start-chapters { break-before: page; }
  .figure { break-before: page; break-after: page; break-inside: avoid; border-top: 1.5mm solid #591C37; padding-top: 4mm; }
  .figure p { margin: 0 0 .55em; }
  .figure .figure-meta { font-size: 9pt; color: #695b6a; margin-bottom: 3mm; }
  .figure img { display: block; max-width: 100%; width: auto; height: auto; margin: 4mm auto 0; }
  .a4p { page: a4p; --figure-height: 226mm; }
  .a4l { page: a4l; --figure-height: 138mm; }
  .a3p { page: a3p; --figure-height: 348mm; }
  .a3l { page: a3l; --figure-height: 223mm; }
  .a2p { page: a2p; --figure-height: 520mm; }
  .a2l { page: a2l; --figure-height: 346mm; }
  .figure img { max-height: var(--figure-height); }
  .figure h2 { margin-top: 0; }
  .figure.with-intro h3 { margin-top: .6em; }
  .figure.with-intro img { max-height: calc(var(--figure-height) - 40mm); }
`;

const githubDocs = 'https://github.com/magomez36/FIAVL_Arquitectura-de-Software/blob/docs/architecture-4plus1/docs/architecture/academico/';
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const html = await marked.parse(pictures);
  await page.setContent('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>FIAVL Explora · Arquitectura 4+1</title><style>' +
    css + '</style></head><body>' + html + '</body></html>', { waitUntil: 'load' });
  const figures = await page.evaluate(githubDocs => {
    const slug = title => title.toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').replace(/ /g, '-');
    for (const heading of document.querySelectorAll('h2')) heading.id = slug(heading.textContent);
    for (const link of document.querySelectorAll('a[href]')) {
      const path = link.getAttribute('href');
      if (path.startsWith('../')) link.href = new URL(path, githubDocs).href;
    }
    const toc = document.querySelector('#índice');
    document.getElementById('1-introducción').classList.add('start-chapters');
    const cover = document.createElement('section');
    cover.className = 'cover';
    for (let node = document.body.firstElementChild; node && node !== toc; node = document.body.firstElementChild) {
      cover.append(node);
    }
    document.body.prepend(cover);
    const layouts = [
      ['a4p', 655, 850], ['a4l', 990, 515],
      ['a3p', 990, 1310], ['a3l', 1460, 840],
      ['a2p', 1460, 1960], ['a2l', 2110, 1300]
    ];
    const result = [];
    for (const heading of [...document.querySelectorAll('h3')]) {
      const code = heading.textContent.match(/^[A-Z]+-\d{2}/)?.[0];
      if (!code) continue;
      const description = heading.nextElementSibling;
      const container = description.nextElementSibling;
      const image = container.querySelector('img');
      if (!image?.naturalWidth) throw new Error('Imagen no disponible: ' + code);
      const links = container.nextElementSibling;
      const figure = document.createElement('section');
      const scale = ([, width, height]) => Math.min(width / image.naturalWidth, height / image.naturalHeight, 1);
      const variant = layouts.find(format => scale(format) >= 0.72) ??
        [...layouts].sort((a, b) => scale(b) - scale(a))[0];
      figure.className = 'figure ' + variant[0];
      links.className = 'figure-meta';
      heading.before(figure);
      figure.append(heading, description, links, image);
      container.remove();
      const intro = [];
      let previous = figure.previousElementSibling;
      while (previous?.matches('p')) {
        intro.unshift(previous);
        previous = previous.previousElementSibling;
      }
      if (previous?.matches('h2') && /^[4-8]\. /.test(previous.textContent)) {
        figure.prepend(previous, ...intro);
        figure.classList.add('with-intro');
      }
      result.push([code, variant[0], scale(variant).toFixed(2)]);
    }
    return result;
  }, githubDocs);
  if (figures.length !== 33) throw new Error('Figuras académicas: ' + figures.length);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: resolve(folder, paper + '.pdf'), printBackground: true, preferCSSPageSize: true, tagged: true });
  for (const figure of figures) console.log(figure.join('\t'));
} finally {
  await browser.close();
}
