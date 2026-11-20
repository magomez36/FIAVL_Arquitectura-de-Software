import assert from 'node:assert/strict';
import { test } from 'node:test';
import { errorSchema } from '@fiavl/contracts';
import { startTestApi } from './helpers/api.ts';

test('Spec 10: namespace de opiniones pendiente', async t => {
  const request = await startTestApi(t);
  const response = await request('feedback', 'POST');
  assert.equal(response.status, 501);
  assert.deepEqual(errorSchema.parse(await response.json()).error, {
    code: 'NOT_IMPLEMENTED', message: 'Opiniones aún no está disponible.'
  });
});
