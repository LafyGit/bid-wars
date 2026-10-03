import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categoryUnlocked, groupProductId, PRO_ID, ownsGroup, ALL_PRODUCT_IDS } from '../../store/entitlements.ts';
import { CATALOG, GROUPS } from '../../content/catalog.ts';

test('free categories are always open, paid ones are locked by default', () => {
  const free = CATALOG.find((c) => c.free)!;
  const paid = CATALOG.find((c) => !c.free)!;
  assert.equal(categoryUnlocked(free.id, []), true);
  assert.equal(categoryUnlocked(paid.id, []), false);
});

test('a group pack unlocks only its own group', () => {
  const g = GROUPS[0], other = GROUPS[1];
  const paidInG = CATALOG.find((c) => g.categoryIds.includes(c.id) && !c.free)!;
  const paidInOther = CATALOG.find((c) => other.categoryIds.includes(c.id) && !c.free)!;
  const owned = [groupProductId(g.id)];
  assert.equal(categoryUnlocked(paidInG.id, owned), true);
  assert.equal(categoryUnlocked(paidInOther.id, owned), false);
  assert.equal(ownsGroup(owned, g.id), true);
  assert.equal(ownsGroup(owned, other.id), false);
});

test('Pro unlocks everything', () => {
  for (const c of CATALOG) assert.equal(categoryUnlocked(c.id, [PRO_ID]), true, c.id);
});

test('product ids are unique and well formed', () => {
  assert.equal(new Set(ALL_PRODUCT_IDS).size, ALL_PRODUCT_IDS.length);
  assert.equal(ALL_PRODUCT_IDS.length, GROUPS.length + 1);
  for (const id of ALL_PRODUCT_IDS) assert.match(id, /^com\.lafyalmutlaq\.bidwars\.[a-z.]+$/);
});
