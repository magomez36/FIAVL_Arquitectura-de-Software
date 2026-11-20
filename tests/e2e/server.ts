import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../../apps/api/src/db.ts';
import { seed } from '../../apps/api/src/seed.ts';
import { composeApp } from '../../apps/api/src/composition.ts';

const dir = mkdtempSync(join(tmpdir(), 'fiavl-smoke-'));
const db = openDatabase(join(dir, 'smoke.sqlite'));
seed(db);
const server = composeApp(db).listen(3001, '127.0.0.1');
const close = () => server.close(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
process.once('SIGTERM', close);
process.once('SIGINT', close);
