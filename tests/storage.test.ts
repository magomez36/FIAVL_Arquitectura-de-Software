import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readLocal, writeLocal, storageKeys } from '../apps/web/src/lib/storage.ts';

test('cada función conserva su clave y tolera datos locales dañados', t => {
  const values = new Map<string, string>();
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  t.after(() => {
    if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    localStorage: {
      setItem: (key: string, value: string) => values.set(key, value),
      getItem: (key: string) => values.get(key) ?? null
    }
  } });
  assert(writeLocal('agenda', ['umbral-de-luz']));
  assert.deepEqual(readLocal('agenda', value => value), ['umbral-de-luz']);
  assert.equal(readLocal('reservations', value => value), undefined);
  values.set(storageKeys.agenda, 'no es JSON');
  assert.equal(readLocal('agenda', value => value), undefined);
});
