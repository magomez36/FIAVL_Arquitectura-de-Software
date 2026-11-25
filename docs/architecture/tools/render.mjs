import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const docs = fileURLToPath(new URL('../', import.meta.url));
const [mermaidBundle, playwrightModule, pngDirectory] = process.argv.slice(2);
if (!mermaidBundle || !playwrightModule) {
  throw new Error('Uso: node render.mjs <mermaid/dist/mermaid.min.js> <playwright/index.mjs> [carpeta PNG]');
}

async function listMarkdown(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listMarkdown(path));
    else if (entry.name.endsWith('.md')) files.push(path);
  }
  return files;
}

const figures = new Map();
const marker = /<!-- diagram: ([A-Z]+-\d{2}) -->\s*\x60\x60\x60mermaid\r?\n([\s\S]*?)\r?\n\x60\x60\x60/g;
for (const path of await listMarkdown(docs)) {
  const markdown = await readFile(path, 'utf8');
  for (const [, id, body] of markdown.matchAll(marker)) {
    if (figures.has(id)) throw new Error(`Identificador duplicado: ${id}`);
    figures.set(id, body.replace(/\r\n/g, '\n').trimEnd() + '\n');
  }
}
if (figures.size === 0) throw new Error('Sin figuras canónicas');

const { chromium } = await import(pathToFileURL(resolve(playwrightModule)).href);
const browser = await chromium.launch({ args: ['--disable-lcd-text'] });
try {
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  const sourceDir = resolve(docs, 'diagrams');
  const svgDir = resolve(docs, 'rendered/svg');
  await mkdir(sourceDir, { recursive: true });
  await mkdir(svgDir, { recursive: true });
  if (pngDirectory) await mkdir(pngDirectory, { recursive: true });
  await page.setContent('<!doctype html><html lang="es"><meta charset="utf-8"><body style="margin:0;background:white"><main></main></body></html>');
  await page.addScriptTag({ path: resolve(mermaidBundle) });
  await page.evaluate(() => {
    globalThis.mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      htmlLabels: false,
      theme: 'neutral',
      fontFamily: 'Arial, sans-serif',
      themeVariables: { noteBkgColor: '#ffffff', noteTextColor: '#000000', noteBorderColor: '#555555' },
      flowchart: { useMaxWidth: false, htmlLabels: false, nodeSpacing: 23, rankSpacing: 32, padding: 12 },
      class: { useMaxWidth: false, hideEmptyMembersBox: true },
      sequence: {
        useMaxWidth: false, mirrorActors: false, wrap: true,
        width: 142, height: 65, actorMargin: 30, boxMargin: 7, messageMargin: 15,
        messageFontSize: 13, noteFontSize: 12
      }
    });
  });

  let failures = 0;
  for (const [id, source] of [...figures].sort()) {
    try {
      const { svg, viewBox, diagramType } = await page.evaluate(async ({ id, source }) => {
        const { diagramType } = await globalThis.mermaid.parse(source);
        const result = await globalThis.mermaid.render('fiavl-' + id, source);
        document.querySelector('main').innerHTML = result.svg;
        const diagram = document.querySelector('main svg');
        if (!diagram || !diagram.viewBox.baseVal.width) throw new Error('SVG vacío');
        const original = diagram.viewBox.baseVal;
        for (const lifeline of diagram.querySelectorAll('line.actor-line')) {
          lifeline.setAttribute('y2', original.y + original.height - 10);
        }
        const drawn = diagram.getBBox();
        if (!drawn.width || !drawn.height) throw new Error('El dibujo no tiene extensión');
        const pad = 12;
        const left = Math.floor(Math.min(original.x, drawn.x) - pad);
        const top = Math.floor(Math.min(original.y, drawn.y) - pad);
        const width = Math.ceil(Math.max(original.x + original.width, drawn.x + drawn.width) + pad - left);
        const height = Math.ceil(Math.max(original.y + original.height, drawn.y + drawn.height) + pad - top);
        const viewBox = [left, top, width, height].join(' ');
        diagram.setAttribute('viewBox', viewBox);
        diagram.setAttribute('width', width);
        diagram.setAttribute('height', height);
        diagram.setAttribute('style', 'display:block;background:white;filter:grayscale(1)');
        return { svg: new XMLSerializer().serializeToString(diagram), viewBox, diagramType };
      }, { id, source });
      await writeFile(resolve(sourceDir, id + '.mmd'), source);
      await writeFile(resolve(svgDir, id + '.svg'), svg + '\n');
      if (pngDirectory) {
        const [, , width, height] = viewBox.split(/\s+/).map(Number);
        await page.setViewportSize({ width: Math.ceil(width), height: Math.ceil(height) });
        await page.locator('main svg').screenshot({ path: resolve(pngDirectory, id + '.png'), animations: 'disabled' });
      }
      console.log([id, diagramType, viewBox].join('\t'));
    } catch (error) {
      failures++;
      console.error(id, error.message);
    }
  }
  if (failures) process.exitCode = 1;
} finally {
  await browser.close();
}
