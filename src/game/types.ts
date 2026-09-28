export type Player = 0 | 1;
export type Pair<T> = [T, T];

export type Phase = 'hidden' | 'item' | 'auction' | 'result';

export type RoundResult =
  | { type: 'win'; w: Player; price: number }
  | { type: 'unclaimed' };

export type BidEvent = { p: Player; amount: number };

export type LogEntry = {
  item: string;
  /** Highest amount each player bid on this item (0 if they never bid). */
  bids: Pair<number>;
  /** 0 / 1 winner, -1 unclaimed */
  w: Player | -1;
  price: number;
  /** Both players bid at least once. */
  contested: boolean;
  /** Number of bids placed on the item. */
  raises: number;
  after: Pair<number>;
};

export type Collected = { name: string; price: number };

export type RoundState = {
  topicId: string;
  items: string[];
  idx: number;
  budgets: Pair<number>;
  /** Budgets before the current item resolved (strike-through / tween start). */
  prev: Pair<number>;
  collections: Pair<Collected[]>;
  log: LogEntry[];
  phase: Phase;
  /** Who acts first on this item; alternates every item. */
  opener: Player;
  /** Whose move it is during the auction. */
  turn: Player;
  /** Current high bid; 0 with no leader means nobody has bid yet. */
  price: number;
  leader: Player | -1;
  /** A player who passed is out for this item. */
  passed: Pair<boolean>;
  /** Every bid placed on this item, in order. */
  history: BidEvent[];
  /** 3-second rule: 0 = idle, 1 = going once, 2 = twice, 3 = sold. */
  going: 0 | 1 | 2 | 3;
  result: RoundResult | null;
  /** 0 = sold line shown, 1 = verdict shown */
  resultStage: 0 | 1;
  /** Bumps on each verdict so bursts replay. */
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
  /** Going once, going twice, sold: the other player has 3 seconds to raise. */
  threeSecondRule: boolean;
  /** AI judge on the final collections screen. */
  aiJudge: boolean;
};

export type Award = {
  title: 'BIG SPENDER' | 'BARGAIN KING' | 'BROKE EARLY' | 'THE SAVER' | 'AUCTION THIEF' | 'WAR MACHINE';
  w: Player;
  desc: string;
};
