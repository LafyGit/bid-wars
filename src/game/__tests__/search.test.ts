import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../../content/catalog.ts';
import { searchTopics as search } from '../search.ts';

const TOPICS = CATALOG.flatMap((c) => c.subtopics.map((s) => ({ ...s, categoryTitle: c.title })));
const searchTopics = (q: string) => search(TOPICS, q);

test('empty or blank queries find nothing', () => {
  assert.deepEqual(searchTopics(''), []);
  assert.deepEqual(searchTopics('   '), []);
  assert.deepEqual(searchTopics('!!'), []);
});

test('matches pack names, ignoring case, accents and hyphens', () => {
  const t = TOPICS.find((x) => /Pok[ée]mon/.test(x.title))!;
  assert.ok(searchTopics('pokemon').includes(t));
  assert.ok(searchTopics('POKÉ').includes(t));
  const marvel = TOPICS.find((x) => x.title === 'Marvel Movies')!;
  assert.equal(searchTopics('marvel mov')[0], marvel);
});

test('a category name finds its packs, after packs named that way', () => {
  const t = TOPICS.find((x) => x.categoryTitle === 'F1')!;
  const res = searchTopics('f1');
  assert.ok(res.length > 0 && res.every((x) => x.categoryTitle === 'F1' || /f1/i.test(x.title)));
  assert.ok(res.includes(t));
});

test('never matches on secret items', () => {
  // "Blade Storm" is a Valorant ultimate (an item), not a pack or category name.
  assert.deepEqual(searchTopics('blade storm'), []);
});
