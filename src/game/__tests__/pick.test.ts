import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickItems, pickTopicId, remember, SEEN_LIMIT } from '../pick.ts';

const pool = Array.from({ length: 30 }, (_, i) => `Item ${i}`);

test('prefers unseen items and records what was shown', () => {
  const a = pickItems(pool, 10, []);
  assert.equal(a.items.length, 10);
  assert.equal(new Set(a.items).size, 10);
  const b = pickItems(pool, 10, a.seen);
  assert.equal(b.items.filter((x) => a.items.includes(x)).length, 0, 'second round shares nothing with the first');
  const c = pickItems(pool, 10, b.seen);
  assert.equal(c.items.filter((x) => a.items.includes(x) || b.items.includes(x)).length, 0, 'third round is fresh too');
});

test('when the pool runs out, the least recently seen items come back first', () => {
  const small = Array.from({ length: 12 }, (_, i) => `S${i}`);
  const a = pickItems(small, 10, []);
  const b = pickItems(small, 10, a.seen);
  const fromA = b.items.filter((x) => a.items.includes(x)).length;
  assert.equal(fromA, 8, 'the 2 unseen items plus the 8 oldest');
  assert.equal(b.items.length, 10);
});

test('the same name in another pack counts as seen, case-insensitively', () => {
  const other = ['item 1', 'ITEM 2', 'Brand new', 'Another', 'Fresh', 'New one', 'Extra', 'More', 'Yet more', 'Last'];
  const out = pickItems(other, 5, ['item 1', 'item 2']);
  assert.ok(!out.items.includes('item 1') && !out.items.includes('ITEM 2'));
});

test('history is capped and never holds duplicates', () => {
  let seen: string[] = [];
  for (let i = 0; i < 200; i++) seen = pickItems(pool, 10, seen).seen;
  assert.ok(seen.length <= SEEN_LIMIT);
  assert.equal(new Set(seen).size, seen.length);
});

test('random topic avoids recent ones but still works when everything is recent', () => {
  const ids = ['a', 'b', 'c', 'd'];
  for (let i = 0; i < 50; i++) assert.ok(['c', 'd'].includes(pickTopicId(ids, ['a', 'b'])));
  assert.ok(ids.includes(pickTopicId(ids, ['a', 'b', 'c', 'd'])));
  assert.deepEqual(remember(['x', 'y'], 'x'), ['y', 'x']);
});

import { suggest, decideCopy } from '../../content/decide.ts';

test('suggest picks from the pool, avoids repeats, and falls back when everything was shown', () => {
  const pool = [{ title: 'A', items: ['one', 'two'] }, { title: 'B', items: ['three'] }];
  const seen: string[] = [];
  for (let i = 0; i < 3; i++) { const s = suggest(pool, seen)!; assert.ok(!seen.includes(s.item)); seen.push(s.item); }
  assert.equal(new Set(seen).size, 3);
  assert.ok(suggest(pool, seen), 'never returns nothing while the pool has items');
  assert.equal(suggest([], []), null);
  assert.ok(decideCopy('food') && decideCopy('travel') && decideCopy('screen') && decideCopy('nope') === null);
});
