import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanItems, cleanTitle, customTopic, isCustomId, MAX_ITEMS, MIN_ITEMS, ITEM_MAX, newPackId, packProblem, validPacks } from '../../content/custom.ts';
import { canAddCustomPack, PRO_ID, groupProductId, topicUnlocked } from '../../store/entitlements.ts';

const ten = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`);

test('items: one per line, order kept, blanks, spaces and repeats cleaned', () => {
  assert.deepEqual(cleanItems('  Mum \n\nDad\n mum\nUncle   Sam\n\t\n'), ['Mum', 'Dad', 'Uncle Sam']);
  assert.deepEqual(cleanItems(''), []);
  assert.deepEqual(cleanItems('\n\n  \n'), []);
  assert.equal(cleanItems('x'.repeat(200))[0].length, ITEM_MAX);
  assert.equal(cleanItems(Array.from({ length: 90 }, (_, i) => `n${i}`).join('\n')).length, MAX_ITEMS);
  assert.deepEqual(cleanItems('a\r\nb'), ['a', 'b']);
});

test('a pack needs a name and at least a round of items', () => {
  assert.equal(packProblem('', ten), 'Give it a name');
  assert.equal(packProblem('   ', ten), 'Give it a name');
  assert.equal(packProblem('Office', ten.slice(0, 7)), 'Add 3 more');
  assert.equal(packProblem('Office', ten), null);
  assert.equal(packProblem('Office', [...ten, 'Pachycephalosaurus']), null, '18 letters fit');
  assert.equal(packProblem('Office', [...ten, 'Supercalifragilistic bake-off']), 'Shorten a long word');
  assert.equal(packProblem('Antidisestablishmentarianism', ten), 'Shorten a long word');
  assert.equal(MIN_ITEMS, 10);
  assert.equal(cleanTitle('  The   Office  ').length, 'The Office'.length);
});

test('saved packs: broken or too-short entries are dropped, good ones survive', () => {
  const good = { id: 'custom-a1', title: 'Office', items: ten, accent: '#fff' };
  assert.deepEqual(validPacks(null), []);
  assert.deepEqual(validPacks({}), []);
  assert.deepEqual(validPacks([good, { id: 'custom-b', title: 'x', items: ['one'] }, { id: 'valorant-maps', title: 'x', items: ten }, 42]), [good]);
  assert.equal(validPacks([{ ...good, accent: undefined }])[0].accent.startsWith('#'), true);
});

test('ids are custom, unique enough, and the topic plays as a normal pack', () => {
  const a = newPackId(1, () => 0.1), b = newPackId(1, () => 0.2);
  assert.ok(isCustomId(a) && a !== b);
  const t = customTopic({ id: a, title: 'Office', items: ten, accent: '#fff' });
  assert.equal(t.items.length, 10);
  assert.equal(topicUnlocked(t, []), true, 'custom packs play without buying anything');
});

test('one free pack; Pro makes as many as you like; old group packs do not count', () => {
  assert.equal(canAddCustomPack([], 0), true);
  assert.equal(canAddCustomPack([], 1), false);
  assert.equal(canAddCustomPack([groupProductId('gaming')], 1), false);
  assert.equal(canAddCustomPack([PRO_ID], 25), true);
});
