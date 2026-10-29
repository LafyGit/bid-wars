import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, GROUPS } from '../../content/catalog.ts';

const subs = CATALOG.flatMap((c) => c.subtopics.map((s) => ({ ...s, cat: c.id })));

test('every subtopic is playable: at least 10 unique, non-empty items', () => {
  for (const s of subs) {
    assert.ok(s.items.length >= 10, `${s.id} has ${s.items.length} items`);
    assert.equal(new Set(s.items).size, s.items.length, `${s.id} has duplicate items`);
    assert.ok(s.items.every((i) => i.trim().length > 0 && !i.includes('?')), `${s.id} has an empty or placeholder item`);
  }
});

test('ids are unique', () => {
  assert.equal(new Set(subs.map((s) => s.id)).size, subs.length, 'duplicate subtopic id');
  assert.equal(new Set(CATALOG.map((c) => c.id)).size, CATALOG.length, 'duplicate category id');
  assert.equal(new Set(GROUPS.map((g) => g.id)).size, GROUPS.length, 'duplicate group id');
});

test('every category belongs to exactly one group and every group member exists', () => {
  const ids = CATALOG.map((c) => c.id);
  const grouped = GROUPS.flatMap((g) => g.categoryIds);
  assert.equal(new Set(grouped).size, grouped.length, 'a category is in two groups');
  for (const id of ids) assert.ok(grouped.includes(id), `category ${id} is in no group`);
  for (const id of grouped) assert.ok(ids.includes(id), `group references unknown category ${id}`);
});

test('all gaming categories sit in the Gaming group', () => {
  const gaming = GROUPS.find((g) => g.id === 'gaming')!;
  for (const id of ['valorant', 'cs2', 'league', 'fortnite', 'minecraft', 'fps', 'games', 'gametypes', 'nintendo', 'gta']) {
    assert.ok(gaming.categoryIds.includes(id), `${id} should be in Gaming`);
  }
});

test('most packs are free and a few niche categories are Pro', () => {
  const pro = CATALOG.filter((c) => !c.free);
  const packs = (cs: typeof CATALOG) => cs.reduce((n, c) => n + c.subtopics.length, 0);
  assert.ok(pro.length >= 5, 'Pro needs something to unlock');
  assert.ok(packs(CATALOG.filter((c) => c.free)) > packs(CATALOG) * 0.7, 'the free tier is the bulk of the game');
});
