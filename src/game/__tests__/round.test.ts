import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  startRound, revealItem, startBidding, placeBid, pass, goingTick, canBid, minBid,
  showVerdict, nextItem, chooseWinner, awardsList, quip, newSession, shuffle, BUDGET, MAX_ITEMS,
} from '../round.ts';
import type { RoundState, Player } from '../types.ts';

const ITEMS = ['Pizza', 'Cheeseburger', 'Tacos', 'Chicken Wings', 'Sushi', 'Spaghetti', 'Fried Chicken', 'Steak', 'Ramen', 'Escargot'];
const NAMES: [string, string] = ['Lafy', 'Dhari'];
const fresh = () => startRound('food', ITEMS, 0);
const open = (s: RoundState) => startBidding(revealItem(s));

/** Run a sequence of moves: numbers are bids, 'p' is a pass. Turn order is enforced by the reducer. */
function play(s: RoundState, moves: (number | 'p')[]): RoundState {
  s = open(s);
  for (const m of moves) {
    const p = s.turn;
    s = m === 'p' ? pass(s, p) : placeBid(s, p, m);
  }
  return showVerdict(s);
}

test('opener bids, other passes: sold to the leader at their bid', () => {
  const s = play(fresh(), [3, 'p']);
  assert.deepEqual(s.result, { type: 'win', w: 0, price: 3 });
  assert.deepEqual(s.budgets, [17, 20]);
  assert.deepEqual(s.collections[0], [{ name: 'Pizza', price: 3 }]);
  assert.equal(s.log[0].contested, false);
  assert.equal(s.log[0].raises, 1);
});

test('back-and-forth raises until one passes', () => {
  const s = play(fresh(), [1, 2, 3, 4, 5, 'p']);
  assert.deepEqual(s.result, { type: 'win', w: 0, price: 5 });
  assert.deepEqual(s.budgets, [15, 20]);
  assert.deepEqual(s.log[0].bids, [5, 4]);
  assert.equal(s.log[0].contested, true);
  assert.equal(s.log[0].raises, 5);
});

test('each bid must beat the price by at least $1 and stay within budget', () => {
  let s = open(fresh());
  assert.equal(minBid(s), 1);
  s = placeBid(s, 0, 0);
  assert.equal(s.leader, -1, '$0 is not a bid');
  s = placeBid(s, 0, 4);
  assert.equal(minBid(s), 5);
  const same = placeBid(s, 1, 4);
  assert.equal(same, s, 'matching the price is rejected');
  const over = placeBid(s, 1, 21);
  assert.equal(over, s, 'over budget is rejected');
  const wrongTurn = placeBid(s, 0, 6);
  assert.equal(wrongTurn, s, 'not your turn');
  s = placeBid(s, 1, 5);
  assert.equal(s.price, 5);
  assert.equal(s.leader, 1);
});

test('both pass with no bid: it goes free, to the opener on a tie and to fewer items otherwise', () => {
  let s = play(fresh(), ['p', 'p']);
  assert.deepEqual(s.result, { type: 'win', w: 0, price: 0, free: true });
  assert.deepEqual(s.budgets, [20, 20]);
  assert.equal(quip(s, NAMES), 'Nobody bid. Lafy gets Pizza free.');
  s = play(nextItem(s), ['p', 'p']);
  assert.deepEqual(s.result, { type: 'win', w: 1, price: 0, free: true }, 'Dhari has fewer items');
});

test('every item is claimed and both players end with exactly 5, whatever they do', () => {
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let game = 0; game < 300; game++) {
    let s = fresh();
    for (let i = 0; i < 10; i++) {
      s = startBidding(revealItem(s));
      for (let guard = 0; s.phase === 'auction' && guard < 100; guard++) {
        const p = s.turn;
        s = canBid(s, p) && rand() < 0.5 ? placeBid(s, p, minBid(s) + Math.floor(rand() * 3)) : pass(s, p);
        if (s.phase === 'auction' && s.turn === p && !s.passed[p]) s = pass(s, p); // over-budget bid was rejected
      }
      assert.equal(s.phase, 'result');
      if (i < 9) s = nextItem(showVerdict(s));
    }
    assert.deepEqual([s.collections[0].length, s.collections[1].length], [5, 5]);
    assert.equal(s.log.length, 10);
  }
});

test('a full shelf hands the rest to the other player for free without an auction', () => {
  let s = fresh();
  for (let i = 0; i < MAX_ITEMS; i++) { s = play(s, s.opener === 0 ? [1, 'p'] : ['p', 1]); s = nextItem(s); }
  s = startBidding(revealItem(s));
  assert.equal(s.phase, 'result');
  assert.deepEqual(s.result, { type: 'win', w: 1, price: 0, free: true });
  assert.equal(quip(s, NAMES), `Lafy's shelf is full. ${ITEMS[5]} goes to Dhari free.`);
});

test('opener passes, other bids: nobody is left to raise, so it sells on the spot', () => {
  let s = open(fresh());
  s = pass(s, 0);
  assert.equal(s.turn, 1);
  s = placeBid(s, 1, 2);
  assert.equal(s.phase, 'result');
  assert.deepEqual(s.result, { type: 'win', w: 1, price: 2 });
  assert.equal(s.log[0].contested, false);
});

test('3-second rule: going once, twice, sold', () => {
  let s = open(fresh());
  s = placeBid(s, 0, 2);
  s = goingTick(s); assert.equal(s.going, 1);
  s = goingTick(s); assert.equal(s.going, 2);
  s = placeBid(s, 1, 3);
  assert.equal(s.going, 0, 'a raise resets the count');
  s = goingTick(s); s = goingTick(s); s = goingTick(s);
  assert.equal(s.phase, 'result');
  assert.deepEqual(s.result, { type: 'win', w: 1, price: 3 });
  assert.equal(quip(showVerdict(s), NAMES), 'Lafy blinked. Sold on the three count.');
});

test('goingTick does nothing without a leader', () => {
  const s = open(fresh());
  assert.equal(goingTick(s), s);
});

test('5-item cap: a full player cannot bid', () => {
  let s = fresh();
  for (let i = 0; i < MAX_ITEMS; i++) { s = play(s, s.opener === 0 ? [1, 'p'] : ['p', 1]); s = nextItem(s); }
  assert.equal(s.collections[0].length, MAX_ITEMS);
  assert.equal(canBid(open(s), 0), false);
});

test('opener alternates every item and budgets carry', () => {
  let s = play(fresh(), [2, 'p']);
  s = nextItem(s);
  assert.equal(s.idx, 1);
  assert.equal(s.opener, 1);
  assert.equal(s.turn, 1);
  assert.equal(s.phase, 'hidden');
  assert.equal(s.price, 0);
  assert.deepEqual(s.budgets, [18, 20]);
});

test('a full round produces awards, session stats and match score', () => {
  let s = fresh();
  const script: (number | 'p')[][] = [
    [3, 'p'],            // P0 Pizza $3
    ['p', 4, 'p'],       // P1 Cheeseburger $4 (P0 opens by passing)
    [1, 2, 3, 4, 5, 6, 'p'], // P0 wins Tacos after 6 bids (war)
    [1, 'p'],            // P1 opens: Chicken Wings $1
    [1, 2, 'p'],         // P0 Sushi $2
    ['p', 1, 'p'],       // P1 Spaghetti $1
    ['p', 'p'],          // nobody bids on Fried Chicken
    [2, 3, 'p'],         // P1 opens 2, P0 3 → P0 Steak $3
    [1, 'p'],            // Ramen: P0's shelf is full, so no auction
    [1, 'p'],            // Escargot: same
  ];
  script.forEach((m, i) => { s = play(s, m); if (i < 9) s = nextItem(s); });
  // Openers alternate. P0 wins Pizza 3, Cheeseburger 4, Spaghetti 1, Steak 3 and gets Fried Chicken free (nobody bid,
  // tied 3-3, P0 opened). That fills P0's shelf, so Ramen and Escargot go to P1 free; P1 also won Tacos 6, Wings 1, Sushi 2.
  assert.deepEqual(s.budgets, [9, 11]);
  assert.deepEqual([s.collections[0].length, s.collections[1].length], [5, 5]);
  const awards = awardsList(s);
  assert.deepEqual(awards.map((a) => a.title), ['BIG SPENDER', 'BARGAIN KING', 'THE SAVER', 'AUCTION THIEF', 'WAR MACHINE']);
  assert.deepEqual(awards[0], { title: 'BIG SPENDER', w: 1, desc: '$6 on Tacos' });
  assert.deepEqual(awards[1], { title: 'BARGAIN KING', w: 0, desc: 'Spaghetti for $1' });
  assert.deepEqual(awards[4], { title: 'WAR MACHINE', w: 1, desc: 'Outlasted 6 bids for Tacos' });
  const { score, session } = chooseWinner(s, [0, 0], newSession(), 1);
  assert.deepEqual(score, [0, 1]);
  assert.deepEqual(session.items, [5, 5]);
  assert.deepEqual(session.spent, [11, 9]);
  assert.deepEqual(session.biggest, [4, 6]);
  assert.deepEqual(session.cheapest, [1, 1], 'free hand-offs do not count as the cheapest buy');
  assert.equal(quip(s, NAMES), "Lafy's shelf is full. Escargot goes to Dhari free.");
});

test('BROKE EARLY fires for the first player to hit $0', () => {
  let s = play(fresh(), [20, 'p']);
  assert.deepEqual(s.budgets, [0, 20]);
  assert.equal(quip(s, NAMES), 'Lafy spent $20 on Pizza. Bold.');
  s = nextItem(s);
  s = play(s, [2, 'p']);
  assert.ok(awardsList(s).some((x) => x.title === 'BROKE EARLY' && x.w === 0 && x.desc === 'Hit $0 after item 1'));
});

test('shuffle keeps all items and is deterministic with a seeded rand', () => {
  let seed = 1;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const a = shuffle(ITEMS, rand);
  assert.deepEqual(a.slice().sort(), ITEMS.slice().sort());
  assert.notDeepEqual(a, ITEMS);
  assert.equal(BUDGET, 20);
});
