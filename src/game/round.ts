import type { Award, LogEntry, Pair, Player, RoundResult, RoundState, Session } from './types';

export const BUDGET = 20;
export const ITEMS = 10;
/** A player can win at most this many items per round. */
export const MAX_ITEMS = 5;
export const MIN_RAISE = 1;

export const newSession = (): Session => ({ rounds: 0, items: [0, 0], spent: [0, 0], biggest: [0, 0], cheapest: [null, null] });

export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const other = (p: Player): Player => (p === 0 ? 1 : 0);

/** Start a round. `items` must already be shuffled and sliced to 10; the order must never be shown. */
export function startRound(topicId: string, items: string[], opener: Player): RoundState {
  return {
    topicId, items, idx: 0,
    budgets: [BUDGET, BUDGET], prev: [BUDGET, BUDGET],
    collections: [[], []], log: [],
    phase: 'hidden', opener, turn: opener,
    price: 0, leader: -1, passed: [false, false], history: [], going: 0,
    result: null, resultStage: 0, burstKey: 0,
  };
}

export function revealItem(s: RoundState): RoundState {
  if (s.phase !== 'hidden') return s;
  return { ...s, phase: 'item' };
}

export function startBidding(s: RoundState): RoundState {
  if (s.phase !== 'item') return s;
  return { ...s, phase: 'auction', turn: s.opener, price: 0, leader: -1, passed: [false, false], history: [], going: 0 };
}

/** Lowest legal bid for the next raise. */
export const minBid = (s: RoundState) => (s.leader === -1 ? MIN_RAISE : s.price + MIN_RAISE);

/** Highest amount a player could bid on this item. */
export const maxBid = (s: RoundState, p: Player) => s.budgets[p];

export const atItemCap = (s: RoundState, p: Player) => s.collections[p].length >= MAX_ITEMS;

/** Can this player place any legal bid right now? */
export function canBid(s: RoundState, p: Player): boolean {
  return s.phase === 'auction' && s.turn === p && !s.passed[p] && !atItemCap(s, p) && maxBid(s, p) >= minBid(s);
}

/** Place a bid. Must be the player's turn, at least one dollar over the current price, and within budget. */
export function placeBid(s: RoundState, p: Player, amount: number): RoundState {
  if (!canBid(s, p)) return s;
  const a = Math.round(amount);
  if (a < minBid(s) || a > maxBid(s, p)) return s;
  const next: RoundState = { ...s, price: a, leader: p, turn: other(p), history: s.history.concat({ p, amount: a }), going: 0 };
  // Nobody left to raise: the other player already conceded, so it sells on the spot.
  if (s.passed[other(p)]) return resolve(next, { type: 'win', w: p, price: a });
  return next;
}

/** Concede the item. Ends the auction if there is a leader or the other player already passed. */
export function pass(s: RoundState, p: Player): RoundState {
  if (s.phase !== 'auction' || s.turn !== p || s.passed[p]) return s;
  const passed: Pair<boolean> = [s.passed[0], s.passed[1]];
  passed[p] = true;
  const next: RoundState = { ...s, passed, going: 0 };
  if (s.leader !== -1) return resolve(next, { type: 'win', w: s.leader, price: s.price });
  if (passed[other(p)]) return resolve(next, { type: 'unclaimed' });
  return { ...next, turn: other(p) };
}

/** 3-second rule tick: going once → twice → sold. Sold resolves for the leader. */
export function goingTick(s: RoundState): RoundState {
  if (s.phase !== 'auction' || s.leader === -1) return s;
  if (s.going >= 2) return resolve({ ...s, going: 3 }, { type: 'win', w: s.leader, price: s.price });
  return { ...s, going: (s.going + 1) as 1 | 2 };
}

function resolve(s: RoundState, res: RoundResult): RoundState {
  const item = s.items[s.idx];
  const best: Pair<number> = [0, 0];
  s.history.forEach((b) => { best[b.p] = Math.max(best[b.p], b.amount); });
  const base: RoundState = { ...s, phase: 'result', result: res, resultStage: 0, prev: [s.budgets[0], s.budgets[1]] };
  if (res.type === 'win') {
    const budgets: Pair<number> = [s.budgets[0], s.budgets[1]];
    budgets[res.w] -= res.price;
    const collections: Pair<typeof s.collections[0]> = [s.collections[0].slice(), s.collections[1].slice()];
    collections[res.w].push({ name: item, price: res.price });
    const entry: LogEntry = { item, bids: best, w: res.w, price: res.price, contested: best[0] > 0 && best[1] > 0, raises: s.history.length, after: [budgets[0], budgets[1]] };
    return { ...base, budgets, collections, log: s.log.concat(entry) };
  }
  const entry: LogEntry = { item, bids: best, w: -1, price: 0, contested: false, raises: 0, after: [s.budgets[0], s.budgets[1]] };
  return { ...base, log: s.log.concat(entry) };
}

export function showVerdict(s: RoundState): RoundState {
  if (s.phase !== 'result') return s;
  return { ...s, resultStage: 1, burstKey: s.burstKey + 1 };
}

export const isLastItem = (s: RoundState) => s.idx >= ITEMS - 1;

export function nextItem(s: RoundState): RoundState {
  if (isLastItem(s)) return s;
  const opener = other(s.opener);
  return {
    ...s, idx: s.idx + 1, phase: 'hidden', opener, turn: opener,
    price: 0, leader: -1, passed: [false, false], history: [], going: 0,
    result: null, resultStage: 0, prev: [s.budgets[0], s.budgets[1]],
  };
}

/** Fold a finished round into the cumulative session stats and match score. */
export function chooseWinner(s: RoundState, score: Pair<number>, session: Session, w: Player): { score: Pair<number>; session: Session } {
  const sc: Pair<number> = [score[0], score[1]];
  sc[w] += 1;
  const se: Session = {
    rounds: session.rounds + 1,
    items: [session.items[0], session.items[1]],
    spent: [session.spent[0], session.spent[1]],
    biggest: [session.biggest[0], session.biggest[1]],
    cheapest: [session.cheapest[0], session.cheapest[1]],
  };
  ([0, 1] as Player[]).forEach((i) => {
    se.items[i] += s.collections[i].length;
    se.spent[i] += BUDGET - s.budgets[i];
    s.collections[i].forEach((c) => {
      se.biggest[i] = Math.max(se.biggest[i], c.price);
      const ch = se.cheapest[i];
      if (ch === null || c.price < ch) se.cheapest[i] = c.price;
    });
  });
  return { score: sc, session: se };
}

/** Post-round awards. Only the ones that apply, in fixed order. */
export function awardsList(s: RoundState): Award[] {
  const wins = s.log.filter((l) => l.w >= 0);
  const out: Award[] = [];
  if (wins.length) {
    const big = wins.reduce((m, l) => (l.price > m.price ? l : m), wins[0]);
    out.push({ title: 'BIG SPENDER', w: (big.w === 1 ? 1 : 0) as Player, desc: `$${big.price} on ${big.item}` });
  }
  const cheap = ([0, 1] as Player[]).map((i) => wins.filter((l) => l.w === i && l.price <= 1));
  let bk: Player | -1;
  if (cheap[0].length === cheap[1].length) bk = cheap[0].length ? (cheap[0][0].price <= cheap[1][0].price ? 0 : 1) : -1;
  else bk = cheap[0].length > cheap[1].length ? 0 : 1;
  if (bk !== -1) out.push({ title: 'BARGAIN KING', w: bk, desc: `${cheap[bk].map((l) => l.item).join(', ')} for $${cheap[bk][0].price}` });

  const broke = s.log.findIndex((l) => l.after[0] === 0 || l.after[1] === 0);
  if (broke >= 0) {
    const w: Player = s.log[broke].after[0] === 0 ? 0 : 1;
    out.push({ title: 'BROKE EARLY', w, desc: `Hit $0 after item ${broke + 1}` });
  }
  if (s.budgets[0] !== s.budgets[1]) {
    const w: Player = s.budgets[0] > s.budgets[1] ? 0 : 1;
    out.push({ title: 'THE SAVER', w, desc: `Walked away with $${s.budgets[w]} unspent` });
  }
  const ct = ([0, 1] as Player[]).map((i) => wins.filter((l) => l.w === i && l.contested).length);
  if (ct[0] !== ct[1]) {
    const w: Player = ct[0] > ct[1] ? 0 : 1;
    out.push({ title: 'AUCTION THIEF', w, desc: `Won ${ct[w]} contested items` });
  }
  const war = wins.reduce((m, l) => (l.raises > m.raises ? l : m), wins[0]);
  if (war && war.raises >= 6) out.push({ title: 'WAR MACHINE', w: (war.w === 1 ? 1 : 0) as Player, desc: `Outlasted ${war.raises} bids for ${war.item}` });
  return out;
}

/** Banter line on the result screen. First matching rule wins. */
export function quip(s: RoundState, names: Pair<string>): string {
  const R = s.result;
  if (!R) return '';
  const item = s.items[s.idx];
  const left = ITEMS - 1 - s.idx;
  if (R.type === 'unclaimed') return 'Nobody wanted it. Moving on.';
  const w = names[R.w], l = names[1 - R.w], wb = s.budgets[R.w], lb = s.budgets[1 - R.w];
  const raises = s.history.length;
  if (s.going === 3) return `${l} blinked. Sold on the three count.`;
  if (R.price >= 9) return `${w} spent $${R.price} on ${item}. Bold.`;
  if (wb === 0 && left > 0) return `${w} is broke with ${left} item${left > 1 ? 's' : ''} to go.`;
  if (raises === 1 && R.price <= 1) return `${item} for $${R.price}. ${l} didn't even flinch.`;
  if (R.price <= 1) return `${item} for $${R.price}. Robbery.`;
  if (raises >= 6) return `${w} outlasted ${l} after ${raises} bids.`;
  if (atItemCap(s, R.w)) return `${w} is at ${MAX_ITEMS} items. Shelf's full.`;
  if (left > 0 && wb <= 4) return `${w} has $${wb} left and ${left} items still hidden.`;
  if (left > 0) return `${l} keeps $${lb}. Is something better coming?`;
  return 'That was the last one.';
}
