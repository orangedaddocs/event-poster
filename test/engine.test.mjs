import test from 'node:test';
import assert from 'node:assert/strict';
import { engine } from './load-engine.mjs';

test('engine loads and exposes limits', () => {
  assert.equal(engine.X_LIMIT, 280);
  assert.equal(engine.X_LONG_SOFT_LIMIT, 2000);
  assert.equal(engine.NOSTR_SOFT_LIMIT, 500);
});
