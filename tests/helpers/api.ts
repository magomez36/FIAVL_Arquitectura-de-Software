import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { TestContext } from 'node:test';
import { composeApp } from '../../apps/api/src/composition.ts';
import { openDatabase } from '../../apps/api/src/db.ts';

export async function startTestApi(t: TestContext, db = openDatabase(':memory:')) {
  const server = composeApp(db).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    try {
      await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
    } finally {
      db.close();
    }
  });
  const addr = server.address();
  assert(addr && typeof addr === 'object');
  return (path: string, method = 'GET') => fetch('http://127.0.0.1:' + addr.port + '/api/' + path, { method });
}
