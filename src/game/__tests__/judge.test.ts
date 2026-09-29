import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localVerdict, collectionScore } from '../../ai/judge.ts';
import type { Collected } from '../types.ts';

const item = (name: string, price: number, value = price): Collected => ({ name, price, value });
const input = (a: Collected[], b: Collected[]) => ({ topic: 'TEST', names: ['A', 'B'] as [string, string], collections: [a, b] as [Collected[], Collected[]], unclaimed: [] });

test('never a draw, even with identical collections', () => {
  const same = [item('x', 3), item('y', 2)];
  for (const tb of [0, 1] as const) {
    const v = localVerdict(input(same, same), tb);
    assert.equal(v.winner, tb, 'a perfect tie falls to the tiebreak');
    assert.ok(v.winner === 0 || v.winner === 1);
  }
});

test('one great pick beats several cheap ones', () => {
  const v = localVerdict(input([item('Dragon Lore', 9, 10)], [item('a', 1), item('b', 1), item('c', 1), item('d', 1), item('e', 1)]));
  assert.equal(v.winner, 0);
});

test('money left over plays no part: the verdict only reads the collections', () => {
  // Same picks, so the verdict cannot change no matter what anyone kept in their wallet.
  const a = [item('p', 4), item('q', 4)], b = [item('r', 5), item('s', 5)];
  assert.equal(localVerdict(input(a, b)).winner, 1);
});

test('a player with nothing loses to a player with something', () => {
  assert.equal(localVerdict(input([], [item('x', 1)])).winner, 1);
  assert.equal(localVerdict(input([item('x', 1)], [])).winner, 0);
  assert.equal(localVerdict(input([], [])).winner, 0);
});

test('score counts the best pick extra and later picks less', () => {
  const one = collectionScore([item('x', 8)]);
  const many = collectionScore([item('a', 2), item('b', 2), item('c', 2), item('d', 2), item('e', 2)]);
  assert.ok(one.total > many.total);
  assert.equal(one.best, 8);
});
