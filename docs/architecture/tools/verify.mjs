import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = fileURLToPath(new URL('../', import.meta.url));
const indexFile = resolve(docs, '../architecture.md');
const expectedKinds = new Map([['classDiagram', 1], ['flowchart', 9], ['sequenceDiagram', 23]]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.name.endsWith('.md')) files.push(path);
  }
  return files;
}

const anchor = heading => heading.toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').replace(/ /g, '-');
const normalize = value => value.replace(/\r\n/g, '\n').trimEnd();
const markdown = new Map(await Promise.all([indexFile, ...await walk(docs)].map(async path =>
  [path, normalize(await readFile(path, 'utf8'))])));
const canonical = new Map();
let links = 0;
for (const [path, value] of markdown) {
  const marker = /<!-- diagram: ([A-Z]+-\d{2}) -->\s*\x60\x60\x60mermaid\n([\s\S]*?)\n\x60\x60\x60/g;
  const blocks = [...value.matchAll(marker)];
  assert.equal((value.match(/^\x60\x60\x60mermaid$/gm) ?? []).length, blocks.length, path);
  for (const [, id, code] of blocks) {
    assert(!canonical.has(id), `Figura repetida: ${id}`);
    canonical.set(id, { code, path });
  }
  const withoutFences = value.replace(/^\x60\x60\x60[^\n]*\n[\s\S]*?^\x60\x60\x60/gm, '');
  for (const [, href] of withoutFences.matchAll(/\]\(([^\s)]+)\)/g)) {
    if (/^[a-z]+:/i.test(href)) continue;
    const [target, fragment] = href.split('#');
    const destination = target ? resolve(dirname(path), decodeURIComponent(target)) : path;
    assert(await stat(destination).then(() => true, () => false), `Enlace roto: ${path} → ${href}`);
    if (fragment && markdown.has(destination)) {
      const headings = [...markdown.get(destination).matchAll(/^#{1,6} (.+)$/gm)].map(([, title]) => anchor(title));
      assert(headings.includes(decodeURIComponent(fragment)), `Ancla rota: ${path} → ${href}`);
    }
    links++;
  }
}

assert.equal(canonical.size, 33);
const catalog = markdown.get(resolve(docs, 'analysis/02-actores-y-casos-de-uso.md'));
const cases = [...catalog.matchAll(/^### (CU-\d{2}) · (.+)$/gm)].map(([, id, name]) => [id, name]);
assert.equal(new Set(cases.map(([id]) => id)).size, 22);
assert.equal(cases.length, 22);
const sequences = [...canonical.keys()].filter(id => id.startsWith('CU-')).sort();
assert.deepEqual(sequences, cases.map(([id]) => id));
const trace = markdown.get(resolve(docs, '06-matriz-trazabilidad.md'));
const groups = new Set([...trace.matchAll(/^\| \[(\d+)\]\(\.\.\/\.\.\/specs\//gm)].map(([, number]) => Number(number)));
assert.deepEqual([...groups].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

const scenario = canonical.get('ESC-01').code;
const academic = markdown.get(resolve(docs, 'academico/FIAVL_Arquitectura_4plus1.md'));
for (const [id, name] of cases) {
  const entry = canonical.get(id);
  assert(entry.path.endsWith('.md') && entry.path.includes('secuencias'), id);
  assert(markdown.get(entry.path).startsWith(`# ${id} · ${name}`), id);
  assert(trace.includes(`[${id} · ${name}]`) && trace.includes(`[${id}](03-vista-procesos/secuencias/`), id);
  const association = new RegExp(`^  ${id === 'CU-02' ? 'T' : 'V'} -{3,} ${id.replace('-', '')}$`, 'm');
  assert(scenario.includes(`"${id}<br/>${name}"`) && association.test(scenario), id);
}

const observedKinds = new Map();
const academicImages = [...academic.matchAll(/^!\[([A-Z]+-\d{2}) · [^\]]+\]\(\.\.\/rendered\/png\/([A-Z]+-\d{2})\.png\)$/gm)];
assert.equal(academicImages.length, canonical.size);
assert.deepEqual(academicImages.map(([, id]) => id).sort(), [...canonical.keys()].sort());
assert(academicImages.every(([, label, file]) => label === file), 'Etiqueta de figura incoherente');
for (const [id, { code }] of canonical) {
  const neutral = '---\nconfig:\n  theme: neutral\n';
  assert(code.startsWith(neutral), `Tema Mermaid de ${id}`);
  assert(!code.includes('classDef '), `Estilo personalizado de ${id}`);
  const end = code.indexOf('\n---\n', neutral.length - 1);
  assert(end > 0, `Configuración Mermaid sin cierre: ${id}`);
  const kind = code.slice(end + '\n---\n'.length).split(/\s/, 1)[0];
  observedKinds.set(kind, (observedKinds.get(kind) ?? 0) + 1);
  const source = normalize(await readFile(resolve(docs, 'diagrams', id + '.mmd'), 'utf8'));
  assert.equal(source, code, `Fuente extraída distinta: ${id}`);
  const svg = await readFile(resolve(docs, 'rendered/svg', id + '.svg'), 'utf8');
  assert(svg.includes(`id="fiavl-${id}"`) && svg.includes('viewBox='), `SVG ausente o inválido: ${id}`);
  const png = await readFile(resolve(docs, 'rendered/png', id + '.png'));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `PNG inválido: ${id}`);
  assert(png.readUInt32BE(16) > 100 && png.readUInt32BE(20) > 100, `PNG demasiado pequeño: ${id}`);
}
assert.deepEqual(observedKinds, expectedKinds);
for (const [folder, suffix] of [['diagrams', '.mmd'], ['rendered/svg', '.svg'], ['rendered/png', '.png']]) {
  const present = (await readdir(resolve(docs, folder))).filter(name => name.endsWith(suffix));
  assert.deepEqual(present.sort(), [...canonical.keys()].map(id => id + suffix).sort(), folder);
}
console.log(`${canonical.size} figuras, ${cases.length} casos, ${groups.size} specs, ${links} enlaces/anclas locales y ${markdown.size} Markdown verificados.`);
