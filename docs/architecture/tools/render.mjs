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
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  const sourceDir = resolve(docs, 'diagrams');
  const svgDir = resolve(docs, 'rendered/svg');
  await mkdir(sourceDir, { recursive: true });
  await mkdir(svgDir, { recursive: true });
  if (pngDirectory) await mkdir(pngDirectory, { recursive: true });
  await page.setContent('<!doctype html><html lang="es"><meta charset="utf-8"><body style="margin:0"><main></main></body></html>');
  await page.addScriptTag({ path: resolve(mermaidBundle) });
  await page.evaluate(() => {
    globalThis.mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      htmlLabels: false,
      theme: 'base',
      themeVariables: {
        background: '#ffffff', primaryColor: '#F5EDE0', primaryTextColor: '#302237',
        primaryBorderColor: '#591C37', secondaryColor: '#FBF7F0',
        tertiaryColor: '#F8E9CF', lineColor: '#591C37',
        fontFamily: 'Arial, sans-serif', fontSize: '14px',
        noteBkgColor: '#F8E9CF', noteTextColor: '#302237', noteBorderColor: '#591C37'
      },
      flowchart: { useMaxWidth: false, htmlLabels: false, nodeSpacing: 23, rankSpacing: 32, padding: 12 },
      class: { useMaxWidth: false, hideEmptyMembersBox: true },
      sequence: {
        useMaxWidth: false, mirrorActors: false, wrap: true,
        width: 124, height: 48, actorMargin: 30, boxMargin: 7, messageMargin: 15,
        messageFontSize: 13, noteFontSize: 12
      }
    });
  });

  let failures = 0;
  for (const [id, source] of [...figures].sort()) {
    try {
      const { svg, viewBox, diagramType } = await page.evaluate(async ({ id, source }) => {
        const { diagramType } = await globalThis.mermaid.parse(source);
        const { svg } = await globalThis.mermaid.render('fiavl-' + id, source);
        document.querySelector('main').innerHTML = svg;
        const diagram = document.querySelector('main svg');
        if (!diagram || !diagram.viewBox.baseVal.width) throw new Error('SVG vacío');
        diagram.style.display = 'block';
        return { svg, viewBox: diagram.getAttribute('viewBox'), diagramType };
      }, { id, source });
      await writeFile(resolve(sourceDir, id + '.mmd'), source);
      await writeFile(resolve(svgDir, id + '.svg'), svg + '\n');
      if (pngDirectory) {
        const [, , width, height] = viewBox.split(/\s+/).map(Number);
        await page.setViewportSize({ width: Math.ceil(width), height: Math.ceil(height) });
        await page.locator('main svg').screenshot({ path: resolve(pngDirectory, id + '.png') });
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
