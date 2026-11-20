import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categoryUnlocked, groupProductId, PRO_ID, ALL_PRODUCT_IDS, LEGACY_GROUP_PACKS, topicUnlocked } from '../../store/entitlements.ts';
import { CATALOG } from '../../content/catalog.ts';

const packs = CATALOG.flatMap((c) => c.subtopics.map((s) => ({ id: s.id, categoryId: c.id, free: c.free })));

test('free categories are always open, paid ones are locked by default', () => {
  const free = CATALOG.find((c) => c.free)!;
  const paid = CATALOG.find((c) => !c.free)!;
  assert.equal(categoryUnlocked(free.id, []), true);
  assert.equal(categoryUnlocked(paid.id, []), false);
});

test('every pack an old group pack unlocked still exists and is still a paid pack', () => {
  for (const [g, ids] of Object.entries(LEGACY_GROUP_PACKS)) {
    for (const id of ids) {
      const p = packs.find((x) => x.id === id);
      assert.ok(p, `${g} pack ${id} no longer exists`);
      assert.equal(p.free, false, `${g} pack ${id} is free now; fine, but drop it from the legacy list`);
      assert.equal(topicUnlocked(p, [groupProductId(g)]), true, `${g} owners lost ${id}`);
    }
  }
});

test('an old group pack unlocks only its own packs', () => {
  const owned = [groupProductId('gaming')];
  const other = packs.find((p) => LEGACY_GROUP_PACKS.entertainment.includes(p.id))!;
  assert.equal(topicUnlocked(other, owned), false);
  // Internet now mixes old entertainment and lifestyle packs: the tile opens, the lifestyle packs stay locked.
  const ent = [groupProductId('entertainment')];
  assert.equal(categoryUnlocked('internet', ent), true);
  assert.equal(topicUnlocked({ id: 'apps-social', categoryId: 'internet' }, ent), false);
  assert.equal(topicUnlocked({ id: 'memes', categoryId: 'internet' }, ent), true);
});

test('Pro unlocks everything', () => {
  for (const p of packs) assert.equal(topicUnlocked(p, [PRO_ID]), true, p.id);
});

test('product ids never change: Pro plus the five group packs on sale in 1.0.0', () => {
  assert.deepEqual(ALL_PRODUCT_IDS, [PRO_ID, ...['gaming', 'sports', 'entertainment', 'foodtravel', 'lifestyle'].map(groupProductId)]);
  for (const id of ALL_PRODUCT_IDS) assert.match(id, /^com\.lafyalmutlaq\.bidwars\.[a-z.]+$/);
});
