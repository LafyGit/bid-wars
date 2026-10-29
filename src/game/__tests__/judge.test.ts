import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localVerdict, collectionScore, quality } from '../../ai/judge.ts';
import type { Collected } from '../types.ts';

const RANKED = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const item = (name: string, price = 1): Collected => ({ name, price });
const input = (a: Collected[], b: Collected[]) => ({ topic: 'TEST', names: ['A', 'B'] as [string, string], collections: [a, b] as [Collected[], Collected[]], ranked: RANKED });

test('never a draw, even with identical collections', () => {
  const same = [item('a'), item('b')];
  for (const tb of [0, 1] as const) assert.equal(localVerdict(input(same, same), tb).winner, tb);
});

test('better-rated items win no matter what was paid', () => {
  const cheapGood = ['a', 'b', 'c', 'd', 'e'].map((n) => item(n, 0));
  const pricyBad = ['f', 'g', 'h', 'i', 'j'].map((n) => item(n, 20));
  assert.equal(localVerdict(input(cheapGood, pricyBad)).winner, 0);
  assert.equal(localVerdict(input(pricyBad, cheapGood)).winner, 1);
});

test('prices never change the verdict', () => {
  const a = ['a', 'e', 'f', 'i', 'j'], b = ['b', 'c', 'd', 'g', 'h'];
  const v1 = localVerdict(input(a.map((n) => item(n, 1)), b.map((n) => item(n, 19))));
  const v2 = localVerdict(input(a.map((n) => item(n, 19)), b.map((n) => item(n, 1))));
  assert.equal(v1.winner, v2.winner);
});

test('quality follows the pack order and the best pick counts extra', () => {
  assert.equal(quality('a', RANKED), 1);
  assert.ok(quality('b', RANKED) > quality('j', RANKED));
  assert.equal(quality('zzz', RANKED), 0.5);
  assert.equal(collectionScore([item('a'), item('j')], RANKED).top?.name, 'a');
});
