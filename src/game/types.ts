export type Player = 0 | 1;
export type Pair<T> = [T, T];

export type Phase = 'hidden' | 'item' | 'bid' | 'pass' | 'ready' | 'count' | 'result' | 'table';
export type Privacy = 'pass' | 'table';

export type RoundResult =
  | { type: 'win'; w: Player; price: number; coin?: boolean }
  | { type: 'tie'; amount: number }
  | { type: 'unclaimed' };

export type LogEntry = {
  item: string;
  bids: Pair<number>;
  /** 0 / 1 winner, -1 unclaimed */
  w: Player | -1;
  price: number;
  contested: boolean;
  tieBreak: boolean;
  after: Pair<number>;
};

export type Collected = { name: string; price: number };

export type RoundState = {
  topicId: string;
  items: string[];
  idx: number;
  budgets: Pair<number>;
  /** Budgets before the current item resolved (for the strike-through / tween start). */
  prev: Pair<number>;
  collections: Pair<Collected[]>;
  log: LogEntry[];
  phase: Phase;
  bidder: Player;
  first: Player;
  bids: Pair<number>;
  locked: Pair<boolean>;
  tieMin: Pair<number>;
  tieRound: number;
  result: RoundResult | null;
  /** 0 = bids shown, 1 = verdict shown */
  resultStage: 0 | 1;
  count: 3 | 2 | 1;
  /** Table mode only: amount temporarily visible per player. */
  peek: Pair<boolean>;
  /** Bumps on each verdict / round winner so bursts replay. */
  burstKey: number;
};

export type Session = {
  rounds: number;
  items: Pair<number>;
  spent: Pair<number>;
  biggest: Pair<number>;
  cheapest: Pair<number | null>;
};

export type Settings = {
  sound: boolean;
  haptics: boolean;
  reducedMotion: boolean;
  privacy: Privacy;
};

export type Award = {
  title: 'BIG SPENDER' | 'BARGAIN KING' | 'BROKE EARLY' | 'THE SAVER' | 'AUCTION THIEF';
  w: Player;
  desc: string;
};
