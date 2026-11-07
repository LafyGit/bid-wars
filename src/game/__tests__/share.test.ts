import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resultMessage } from '../share.ts';

test('the shared result names the winner, topic and score, and carries the store link', () => {
  const m = resultMessage('Lafy', 'Cars', [2, 1]);
  for (const part of ['Lafy', 'Cars', '2-1', 'https://apps.apple.com/app/id6816925758']) assert.ok(m.includes(part), part);
});
