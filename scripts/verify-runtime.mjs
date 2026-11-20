import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import manifest from '../package.json' with { type: 'json' };
import lock from '../package-lock.json' with { type: 'json' };

assert.deepEqual(lock.packages[''].engines, manifest.engines, 'engines del lockfile');
assert.equal(readFileSync('.nvmrc','utf8').trim(), manifest.engines.node, '.nvmrc');
assert.equal(process.versions.node, manifest.engines.node, 'version de Node');
assert.equal(manifest.packageManager, 'npm@' + manifest.engines.npm, 'packageManager');
assert.match(readFileSync('.npmrc','utf8'), /^engine-strict=true\r?$/m);
