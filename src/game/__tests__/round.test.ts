import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  startRound, revealItem, startBidding, setBid, adjustBid, lockBid, afterLock, handedOver,
  resolve, showVerdict, tieBreak, nextItem, chooseWinner, awardsList, quip, newSession, shuffle, BUDGET,
} from '../round.ts';
import type { RoundState, Player } from '../types.ts';

const ITEMS = ['Pizza', 'Cheeseburger', 'Tacos', 'Chicken Wings', 'Sushi', 'Spaghetti', 'Fried Chicken', 'Steak', 'Ramen', 'Escargot'];
const NAMES: [string, string] = ['Lafy', 'Dhari'];
const fresh = () => startRound('food', ITEMS, 0);

/** Play one item end to end in pass mode. */
function play(s: RoundState, a: number, b: number, coin = () => true): RoundState {
  s = revealItem(s);
  s = startBidding(s, 'pass');
  s = setBid(s, 0, a); s = lockBid(s, 0); s = afterLock(s); s = handedOver(s);
  s = setBid(s, 1, b); s = lockBid(s, 1); s = afterLock(s);
  assert.equal(s.phase, 'ready');
  s = resolve(s, coin);
  return showVerdict(s);
}

test('higher bid wins and pays; loser keeps money', () => {
  const s = play(fresh(), 7, 5);
  assert.deepEqual(s.result, { type: 'win', w: 0, price: 7 });
  assert.deepEqual(s.budgets, [13, 20]);
  assert.deepEqual(s.prev, [20, 20]);
  assert.deepEqual(s.collections[0], [{ name: 'Pizza', price: 7 }]);
  assert.equal(s.collections[1].length, 0);
  assert.equal(s.log[0].contested, true);
});

test('$0 / $0 is unclaimed and goes to nobody', () => {
  const s = play(fresh(), 0, 0);
  assert.deepEqual(s.result, { type: 'unclaimed' });
  assert.deepEqual(s.budgets, [20, 20]);
  assert.equal(s.log[0].w, -1);
  assert.equal(quip(s, NAMES), 'Nobody wanted it. Moving on.');
});

test('tie above $0 triggers a tie-break with the tied amount as minimum', () => {
  let s = play(fresh(), 4, 4);
  assert.deepEqual(s.result, { type: 'tie', amount: 4 });
  assert.equal(quip(s, NAMES), '$4 each. Someone has to blink.');
  s = tieBreak(s, 'pass');
  assert.equal(s.phase, 'bid');
  assert.equal(s.tieRound, 1);
  assert.deepEqual(s.tieMin, [4, 4]);
  assert.deepEqual(s.bids, [4, 4]);
  // minimum is enforced
  s = setBid(s, 0, 2);
  assert.equal(s.bids[0], 4);
  s = adjustBid(s, 0, -1);
  assert.equal(s.bids[0], 4);
  s = adjustBid(s, 0, 1);
  assert.equal(s.bids[0], 5);
});

test('tie-break win is logged as a tie-break and gets the quip', () => {
  let s = play(fresh(), 4, 4);
  s = tieBreak(s, 'pass');
  s = setBid(s, 0, 5); s = lockBid(s, 0); s = afterLock(s); s = handedOver(s);
  s = setBid(s, 1, 4); s = lockBid(s, 1); s = afterLock(s);
  s = showVerdict(resolve(s));
  assert.deepEqual(s.result, { type: 'win', w: 0, price: 5 });
  assert.equal(s.log[0].tieBreak, true);
  assert.equal(quip(s, NAMES), 'Lafy wanted it more.');
});

test('coin toss after two tie-break rounds', () => {
  let s = play(fresh(), 3, 3);
  s = tieBreak(s, 'pass');
  s = setBid(s, 0, 3); s = lockBid(s, 0); s = afterLock(s); s = handedOver(s);
  s = setBid(s, 1, 3); s = lockBid(s, 1); s = afterLock(s);
  s = showVerdict(resolve(s));
  assert.equal(s.result?.type, 'tie');
  s = tieBreak(s, 'pass');
  assert.equal(s.tieRound, 2);
  s = lockBid(s, 0); s = afterLock(s); s = handedOver(s); s = lockBid(s, 1); s = afterLock(s);
  s = showVerdict(resolve(s, () => false));
  assert.deepEqual(s.result, { type: 'win', w: 1, price: 3, coin: true });
  assert.deepEqual(s.budgets, [20, 17]);
  assert.equal(quip(s, NAMES), 'Still dead even. The coin decided.');
});

test('coin toss when neither player can raise', () => {
  let s = fresh();
  s = { ...s, budgets: [5, 5] };
  s = play(s, 5, 5, () => true);
  assert.deepEqual(s.result, { type: 'win', w: 0, price: 5, coin: true });
  assert.deepEqual(s.budgets, [0, 5]);
});

test('bids are capped by budget and floored at zero', () => {
  let s = revealItem(fresh());
  s = startBidding(s, 'pass');
  s = setBid(s, 0, 99);
  assert.equal(s.bids[0], 20);
  s = setBid(s, 0, -3);
  assert.equal(s.bids[0], 0);
  s = lockBid(s, 0);
  s = setBid(s, 0, 5);
  assert.equal(s.bids[0], 0, 'locked bids cannot change');
});

test('first bidder alternates every item; pass order follows it', () => {
  let s = fresh();
  assert.equal(s.first, 0);
  s = play(s, 1, 2);
  s = nextItem(s);
  assert.equal(s.idx, 1);
  assert.equal(s.first, 1);
  assert.equal(s.phase, 'hidden');
  assert.deepEqual(s.bids, [0, 0]);
  s = revealItem(s); s = startBidding(s, 'pass');
  assert.equal(s.bidder, 1);
  s = lockBid(s, 1); s = afterLock(s);
  assert.equal(s.phase, 'pass');
  assert.equal(s.bidder, 0);
});

test('table mode goes straight to the table phase', () => {
  let s = startBidding(revealItem(fresh()), 'table');
  assert.equal(s.phase, 'table');
  s = lockBid(s, 0); s = lockBid(s, 1);
  assert.deepEqual(s.locked, [true, true]);
});

test('a full round produces awards, session stats and match score', () => {
  const hist: [number, number][] = [[3, 2], [1, 4], [2, 4], [7, 5], [2, 3], [1, 0], [2, 5], [0, 0], [6, 4], [1, 0]];
  let s = fresh();
  hist.forEach(([a, b], i) => {
    s = play(s, a, b);
    if (i < 9) s = nextItem(s);
  });
  assert.deepEqual(s.budgets, [20 - 3 - 7 - 1 - 6 - 1, 20 - 4 - 4 - 3 - 5]);
  assert.equal(quip(s, NAMES), 'Escargot for $1. Robbery.');

  const awards = awardsList(s);
  const titles = awards.map((a) => a.title);
  assert.deepEqual(titles, ['BIG SPENDER', 'BARGAIN KING', 'THE SAVER', 'AUCTION THIEF']);
  assert.deepEqual(awards[0], { title: 'BIG SPENDER', w: 0, desc: '$7 on Chicken Wings' });
  assert.deepEqual(awards[1], { title: 'BARGAIN KING', w: 0, desc: 'Spaghetti, Escargot for $1' });
  assert.deepEqual(awards[2], { title: 'THE SAVER', w: 1, desc: 'Walked away with $4 unspent' });
  assert.deepEqual(awards[3], { title: 'AUCTION THIEF', w: 1, desc: 'Won 4 contested items' });

  const { score, session } = chooseWinner(s, [0, 0], newSession(), 1);
  assert.deepEqual(score, [0, 1]);
  assert.equal(session.rounds, 1);
  assert.deepEqual(session.items, [5, 4]);
  assert.deepEqual(session.spent, [18, 16]);
  assert.deepEqual(session.biggest, [7, 5]);
  assert.deepEqual(session.cheapest, [1, 3]);
});

test('BROKE EARLY fires for the first player to hit $0', () => {
  let s = fresh();
  s = play(s, 20, 3);
  assert.deepEqual(s.budgets, [0, 20]);
  assert.equal(quip(s, NAMES), 'Lafy spent $20 on Pizza. Bold.');
  s = nextItem(s);
  s = play(s, 0, 2);
  const a = awardsList(s);
  assert.ok(a.some((x) => x.title === 'BROKE EARLY' && x.w === 0 && x.desc === 'Hit $0 after item 1'));
});

test('quip: broke with items to go beats robbery', () => {
  let s = fresh();
  s = { ...s, budgets: [1, 20] };
  s = play(s, 1, 0);
  assert.equal(quip(s, NAMES), 'Lafy is broke with 9 items to go.');
});

test('quip: last item', () => {
  let s = fresh();
  s = { ...s, idx: 9 };
  s = play(s, 5, 2);
  assert.equal(quip(s, NAMES), 'That was the last one.');
});

test('shuffle keeps all items and is deterministic with a seeded rand', () => {
  let seed = 1;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const a = shuffle(ITEMS, rand);
  assert.deepEqual(a.slice().sort(), ITEMS.slice().sort());
  assert.notDeepEqual(a, ITEMS);
  assert.equal(BUDGET, 20);
});
