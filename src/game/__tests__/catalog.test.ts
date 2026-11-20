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

test('the big shooter and esports games sit in the Gamer section', () => {
  const gamer = GROUPS.find((g) => g.id === 'gamer')!;
  for (const id of ['valorant', 'cs2', 'league', 'fortnite', 'minecraft', 'fps', 'games', 'gametypes', 'gta']) {
    assert.ok(gamer.categoryIds.includes(id), `${id} should be in Gamer`);
  }
});

test('section and tile names stay short', () => {
  for (const g of GROUPS) assert.ok(g.title.length <= 18, `section "${g.title}" is too long`);
  for (const c of CATALOG) assert.ok(c.title.length <= 16, `tile "${c.title}" is too long`);
});

test('most packs are free and a few niche categories are Pro', () => {
  const pro = CATALOG.filter((c) => !c.free);
  const packs = (cs: typeof CATALOG) => cs.reduce((n, c) => n + c.subtopics.length, 0);
  assert.ok(pro.length >= 5, 'Pro needs something to unlock');
  assert.ok(packs(CATALOG.filter((c) => c.free)) > packs(CATALOG) * 0.7, 'the free tier is the bulk of the game');
});

const norm = (s: string) => s.toLowerCase();
const freeItems = new Set(CATALOG.filter((c) => c.free).flatMap((c) => c.subtopics.flatMap((s) => s.items.map(norm))));

/** Names a Pro pack may share with free packs because they mean something else there, or belong to both games. */
const SHARED_ON_PURPOSE: Record<string, string[]> = {
  'cs2-maps': ['Mirage', 'Italy', 'Aztec'], // map names, not the Apex legend, the country or the civilisation
  'cs2-teams': ['NAVI', 'Team Vitality', 'G2 Esports', 'Fnatic', 'Team Liquid', 'Cloud9'], // orgs with CS and Valorant rosters; NAVI is not Zelda's fairy
  'cs2-weapons': ['AK-47', 'FAMAS', 'AUG', 'MAC-10'], // the CS2 guns; CoD has its own
  'games-indie': ['Hades'], // the game, not the Disney villain
  'games-retro': ['Pac-Man', 'Donkey Kong', 'Mega Man'], // the original games, not the characters
  'lux-hoods': ['Monaco', 'Lake Como', 'St. Moritz', 'Aspen'], // where the rich live, not the circuit or the ski trip
  'book-series': ['Harry Potter', 'The Lord of the Rings', 'Dune', 'The Witcher'], // the books, not the films or shows
  'book-manga': ['Monster', 'Pluto'], // the manga, not the energy drink or the dwarf planet
  'gym-styles': ['Swimming', 'Rock Climbing', 'Cycling', 'Rowing'], // as a training plan, not a hobby or an Olympic event
  'myths-greek': ['Hades', 'Ares', 'Nike', 'Nemesis'], // the gods, not the villain, gun, brand or roller coaster
  'myths-norse': ['Thor', 'Odin', 'Loki', 'Mjolnir', 'Asgard'], // the myths, not Marvel or the Valorant gun
  'myths-monsters': ['Dragon', 'Phoenix', 'Werewolf', 'Cyclops', 'Banshee'], // the creatures, not the Pokémon type, agent, party game, X-Man or GTA car
};

test('Pro packs are not copies of free packs: at most 2 items shared with the free tier', () => {
  const bad: string[] = [];
  for (const c of CATALOG.filter((c) => !c.free)) {
    for (const s of c.subtopics) {
      const ok = new Set((SHARED_ON_PURPOSE[s.id] ?? []).map(norm));
      const shared = s.items.filter((i) => freeItems.has(norm(i)) && !ok.has(norm(i)));
      if (shared.length > 2) bad.push(`${s.id}: ${shared.join(', ')}`);
    }
  }
  assert.deepEqual(bad, [], 'Pro packs repeating free items');
});

test('packs in different categories never share more than half their items', () => {
  const bad: string[] = [];
  for (let i = 0; i < subs.length; i++) {
    const a = new Set(subs[i].items.map(norm));
    for (let j = i + 1; j < subs.length; j++) {
      if (subs[i].cat === subs[j].cat) continue; // a themed pack inside its own category (Pixar in Animated Movies) is fine
      const n = subs[j].items.filter((x) => a.has(norm(x))).length;
      const ratio = n / Math.min(subs[i].items.length, subs[j].items.length);
      if (ratio > 0.5) bad.push(`${subs[i].id} + ${subs[j].id}: ${n} shared`);
    }
  }
  assert.deepEqual(bad, [], 'near-duplicate packs');
});
