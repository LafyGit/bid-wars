import type { Award, LogEntry, Pair, Player, Privacy, RoundResult, RoundState, Session } from './types';

export const BUDGET = 20;
export const ITEMS = 10;

export const newSession = (): Session => ({ rounds: 0, items: [0, 0], spent: [0, 0], biggest: [0, 0], cheapest: [null, null] });

export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Start a round. `items` must already be shuffled and sliced to 10; the order must never be shown. */
export function startRound(topicId: string, items: string[], first: Player): RoundState {
  return {
    topicId, items, idx: 0,
    budgets: [BUDGET, BUDGET], prev: [BUDGET, BUDGET],
    collections: [[], []], log: [],
    phase: 'hidden', bidder: first, first,
    bids: [0, 0], locked: [false, false], tieMin: [0, 0], tieRound: 0,
    result: null, resultStage: 0, count: 3, peek: [false, false], burstKey: 0,
  };
}

export function revealItem(s: RoundState): RoundState {
  if (s.phase !== 'hidden') return s;
  return { ...s, phase: 'item' };
}

export function startBidding(s: RoundState, privacy: Privacy): RoundState {
  if (privacy === 'table') return { ...s, phase: 'table', locked: [false, false], peek: [false, false] };
  return { ...s, phase: 'bid', bidder: s.first, locked: [false, false] };
}

/** Clamp to [tieMin, budget]. $0 allowed outside tie-breaks. */
export function setBid(s: RoundState, p: Player, v: number): RoundState {
  if (s.locked[p]) return s;
  const nv = Math.max(s.tieMin[p], Math.min(s.budgets[p], Math.round(v)));
  if (nv === s.bids[p]) return s;
  const bids: Pair<number> = [s.bids[0], s.bids[1]];
  bids[p] = nv;
  return { ...s, bids };
}

export function adjustBid(s: RoundState, p: Player, delta: number): RoundState {
  return setBid(s, p, s.bids[p] + delta);
}

export function lockBid(s: RoundState, p: Player): RoundState {
  if (s.locked[p]) return s;
  const locked: Pair<boolean> = [s.locked[0], s.locked[1]];
  locked[p] = true;
  return { ...s, locked };
}

/** Pass mode: after the lock stamp, hand over or go to the ready screen. */
export function afterLock(s: RoundState): RoundState {
  if (s.phase !== 'bid') return s;
  if (s.locked[0] && s.locked[1]) return { ...s, phase: 'ready' };
  const next: Player = s.locked[0] ? 1 : 0;
  return { ...s, phase: 'pass', bidder: next };
}

export function handedOver(s: RoundState): RoundState {
  if (s.phase !== 'pass') return s;
  return { ...s, phase: 'bid' };
}

export function startCountdown(s: RoundState): RoundState {
  return { ...s, phase: 'count', count: 3 };
}

export function countTick(s: RoundState): RoundState {
  if (s.phase !== 'count' || s.count === 1) return s;
  return { ...s, count: (s.count - 1) as 3 | 2 | 1 };
}

export function setPeek(s: RoundState, p: Player, on: boolean): RoundState {
  const peek: Pair<boolean> = [s.peek[0], s.peek[1]];
  peek[p] = on;
  return { ...s, peek };
}

/**
 * Resolve both bids for the current item.
 * `coin` decides the coin toss (true → P1 wins) and is only consulted when the safety valve fires.
 */
export function resolve(s: RoundState, coin: () => boolean = () => Math.random() < 0.5): RoundState {
  const [a, b] = s.bids;
  const item = s.items[s.idx];
  let res: RoundResult;
  if (a === b) {
    if (a === 0) res = { type: 'unclaimed' };
    else if (s.tieRound >= 2 || (s.budgets[0] <= a && s.budgets[1] <= a)) res = { type: 'win', w: coin() ? 0 : 1, price: a, coin: true };
    else res = { type: 'tie', amount: a };
  } else {
    const w: Player = a > b ? 0 : 1;
    res = { type: 'win', w, price: Math.max(a, b) };
  }

  const next: RoundState = { ...s, phase: 'result', result: res, resultStage: 0, prev: [s.budgets[0], s.budgets[1]], peek: [false, false] };
  if (res.type === 'win') {
    const budgets: Pair<number> = [s.budgets[0], s.budgets[1]];
    budgets[res.w] -= res.price;
    const collections: Pair<typeof s.collections[0]> = [s.collections[0].slice(), s.collections[1].slice()];
    collections[res.w].push({ name: item, price: res.price });
    const entry: LogEntry = { item, bids: [a, b], w: res.w, price: res.price, contested: a > 0 && b > 0, tieBreak: s.tieRound > 0, after: [budgets[0], budgets[1]] };
    return { ...next, budgets, collections, log: s.log.concat(entry) };
  }
  if (res.type === 'unclaimed') {
    const entry: LogEntry = { item, bids: [0, 0], w: -1, price: 0, contested: false, tieBreak: s.tieRound > 0, after: [s.budgets[0], s.budgets[1]] };
    return { ...next, log: s.log.concat(entry) };
  }
  return next;
}

export function showVerdict(s: RoundState): RoundState {
  if (s.phase !== 'result') return s;
  return { ...s, resultStage: 1, burstKey: s.burstKey + 1 };
}

/** Tie-break: both bid again with a minimum equal to the tied amount. */
export function tieBreak(s: RoundState, privacy: Privacy): RoundState {
  if (!s.result || s.result.type !== 'tie') return s;
  const a = s.result.amount;
  const base: RoundState = { ...s, tieMin: [a, a], bids: [a, a], locked: [false, false], tieRound: s.tieRound + 1, result: null, resultStage: 0 };
  return startBidding(base, privacy);
}

export const isLastItem = (s: RoundState) => s.idx >= ITEMS - 1;

export function nextItem(s: RoundState): RoundState {
  if (isLastItem(s)) return s;
  const first: Player = s.first === 0 ? 1 : 0;
  return {
    ...s, idx: s.idx + 1, phase: 'hidden', bids: [0, 0], locked: [false, false], tieMin: [0, 0], tieRound: 0,
    result: null, resultStage: 0, first, bidder: first, prev: [s.budgets[0], s.budgets[1]], peek: [false, false],
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
  return out;
}

/** Banter line on the result screen. First matching rule wins. */
export function quip(s: RoundState, names: Pair<string>): string {
  const R = s.result;
  if (!R) return '';
  const item = s.items[s.idx];
  const left = ITEMS - 1 - s.idx;
  if (R.type === 'unclaimed') return 'Nobody wanted it. Moving on.';
  if (R.type === 'tie') return `$${R.amount} each. Someone has to blink.`;
  const w = names[R.w], l = names[1 - R.w], wb = s.budgets[R.w], lb = s.budgets[1 - R.w];
  if (R.coin) return 'Still dead even. The coin decided.';
  if (R.price >= 9) return `${w} spent $${R.price} on ${item}. Bold.`;
  if (wb === 0 && left > 0) return `${w} is broke with ${left} item${left > 1 ? 's' : ''} to go.`;
  if (R.price <= 1) return `${item} for $${R.price}. Robbery.`;
  if (s.tieRound > 0) return `${w} wanted it more.`;
  if (left > 0 && wb <= 4) return `${w} has $${wb} left and ${left} items still hidden.`;
  if (left > 0) return `${l} keeps $${lb}. Is something better coming?`;
  return 'That was the last one.';
}
