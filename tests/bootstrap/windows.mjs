// Ejecutar manualmente desde la raiz en Windows con Node y Git disponibles.
import assert from 'node:assert/strict';
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, statSync, existsSync, appendFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, basename } from 'node:path';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import { DatabaseSync } from 'node:sqlite';

assert.equal(process.platform, 'win32');
const temp = mkdtempSync(join(tmpdir(), 'FIAVL bootstrap '));
const cwd = join(temp, 'checkout limpio');
console.log('Copia de prueba:', cwd);
const files = execFileSync('git', ['ls-files','-co','--exclude-standard','-z'], {encoding:'utf8'}).split('\0').filter(Boolean);
for (const file of new Set(files)) {
  mkdirSync(dirname(join(cwd,file)), {recursive:true});
  copyFileSync(file, join(cwd,file));
}
const base = Object.fromEntries(Object.entries(process.env).filter(([k]) =>
  !['PATH','FIAVL_DB','FIAVL_NODE_HOME','LOCALAPPDATA'].includes(k.toUpperCase())));
const win = join(process.env.SystemRoot,'System32');
const ps = join(win,'WindowsPowerShell','v1.0');
const env = {...base, LOCALAPPDATA:join(temp,'perfil'), Path:[win,ps].join(';'), npm_config_audit:'false'};
const cmd = process.env.ComSpec;
const {engines} = JSON.parse(readFileSync(join(cwd,'package.json')));
function run(exe, args, options = {}) {
  const r = spawnSync(exe,args,{cwd,env,encoding:'utf8',windowsHide:true,timeout:600000,...options});
  if (r.error) throw r.error;
  return {code:r.status, log:r.stdout+r.stderr};
}
function mode(name, options) {
  const r = run(cmd,['/d','/c','fiavl.cmd',name],options);
  assert.equal(r.code,0,r.log);
  return r.log;
}
const custom = '# conservar\r\nFIAVL_DB="datos propios/demo.sqlite"\r\n';
writeFileSync(join(cwd,'.env'),custom);
assert.equal(run('where.exe',['node.exe']).code,1);
const offline = run(join(ps,'powershell.exe'),['-NoProfile','-ExecutionPolicy','Bypass','-Command',
  "$PSDefaultParameterValues['Invoke-WebRequest:Proxy']='http://127.0.0.1:1'; & ./scripts/bootstrap.ps1 setup; exit $LASTEXITCODE"]);
assert.notEqual(offline.code,0);
assert.match(offline.log,/FIAVL:/);
assert(!existsSync(join(cwd,'node_modules')));
console.log('I: descarga sin conectividad rechazada');
const first = mode('setup');
assert.match(first,/Descargando/);
const dbFile = join(cwd,'datos propios','demo.sqlite');
const db = new DatabaseSync(dbFile);
assert.equal(db.prepare('SELECT count(*) AS n FROM events').get().n,12);
db.exec("UPDATE events SET title='Dato propio' WHERE id='umbral-de-luz'; CREATE TABLE futura(id INTEGER PRIMARY KEY); INSERT INTO futura VALUES(7)");
db.exec("DELETE FROM event_artists WHERE eventId='cauce-final'; DELETE FROM events WHERE id='cauce-final'");
db.close();
console.log('B/D: primer setup sin Node en PATH; catalogo sembrado');

const stamp = join(cwd,'node_modules','.fiavl-install');
const before = statSync(stamp).mtimeMs;
assert.match(mode('setup'),/Dependencias vigentes/);
assert.equal(statSync(stamp).mtimeMs,before);
const rt = join(env.LOCALAPPDATA,'FIAVL','runtime');
const nodeDir = join(rt,'node-v'+engines.node+'-win-'+process.arch);
const cliDir = join(rt,'npm-'+engines.npm);
const compatible = {...env, LOCALAPPDATA:join(temp,'perfil compatible'), Path:[cliDir,nodeDir,env.Path].join(';')};
assert.match(mode('setup',{env:compatible}),/Dependencias vigentes/);
assert(!existsSync(join(compatible.LOCALAPPDATA,'FIAVL','runtime',basename(nodeDir))));
const shell = mode('shell',{env:compatible,input:'node -p "\'SHELL_NODE=\'+process.version"\r\nfor /f %v in (\'npm -v\') do @echo SHELL_NPM=%v\r\nexit\r\n'});
assert(shell.split(/\r?\n/).includes('SHELL_NODE=v'+engines.node),shell);
assert(shell.split(/\r?\n/).includes('SHELL_NPM='+engines.npm),shell);
console.log('C/E/J: pareja compatible, shell y portable reutilizados');
appendFileSync(join(cwd,'package-lock.json'),'\n');
const changed = mode('setup');
assert(!changed.includes('Dependencias vigentes'));
assert(statSync(stamp).mtimeMs > before);
assert.equal(readFileSync(join(cwd,'.env'),'utf8'),custom);
const reopened = new DatabaseSync(dbFile);
assert.equal(reopened.prepare("SELECT title FROM events WHERE id='umbral-de-luz'").get().title,'Dato propio');
assert.equal(reopened.prepare('SELECT id FROM futura').get().id,7);
assert.equal(reopened.prepare('SELECT count(*) AS n FROM events').get().n,11);
reopened.close();
console.log('F/G/K: nueva instalacion, .env intacto y datos conservados');

const busy = createServer();
busy.listen(3001,'127.0.0.1');
await once(busy,'listening');
try {
  const conflict = run(cmd,['/d','/c','fiavl.cmd']);
  assert.notEqual(conflict.code,0);
  assert.match(conflict.log,/Puerto 3001/);
  assert(busy.listening);
} finally { busy.close(); await once(busy,'close'); }
console.log('H: puerto ocupado diagnosticado');
const dev = spawn(cmd,['/d','/c','fiavl.cmd'],{cwd,env,windowsHide:true,stdio:'inherit'});
try {
  let ready = false;
  for (let i=0; i<120 && dev.exitCode===null; i++) {
    try {
      const health = await fetch('http://127.0.0.1:5173/api/health');
      if ((await health.json()).status==='ok') { ready=true; break; }
    } catch { /* Arranque en curso. */ }
    await delay(500);
  }
  assert(ready,'Fallo de arranque');
  assert.equal((await (await fetch('http://127.0.0.1:5173/api/events/umbral-de-luz')).json()).title,'Dato propio');
  assert.match(await (await fetch('http://127.0.0.1:5173/')).text(),/FIAVL Explora/);
  console.log('Inicio: portada y API reales con datos persistidos');
} finally {
  if (dev.exitCode===null) execFileSync('taskkill',['/PID',String(dev.pid),'/T','/F'],{windowsHide:true});
}
const actual = realpathSync(temp);
assert.equal(dirname(actual).toLowerCase(),realpathSync(tmpdir()).toLowerCase());
assert(basename(actual).startsWith('FIAVL bootstrap '));
rmSync(actual,{recursive:true,force:true,maxRetries:3,retryDelay:500});
