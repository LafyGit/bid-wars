import Anthropic from '@anthropic-ai/sdk';
import type { Collected, Pair, Player } from '../game/types';

/**
 * The judge reads both collections at the end of a round and picks a winner on how good the items are in the
 * real world: reviews, ratings, fan and critic consensus. Prices paid and money left are never part of it.
 * It never calls a draw. Advice only: the players still tap the winner.
 *
 * Without a key the built-in judge uses each pack's curated order (catalog items are listed best-first by
 * consensus). Key: EXPO_PUBLIC_ANTHROPIC_API_KEY (see .env.example); it ships inside the bundle, so put a
 * small proxy in front of it before turning it on in a public release.
 */
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
export const judgeAvailable = () => !!API_KEY;

export type JudgeInput = {
  topic: string;
  names: Pair<string>;
  collections: Pair<Collected[]>;
  /** Every item in the pack, best first. */
  ranked: string[];
};

export type Verdict = { winner: Player; headline: string; reasoning: string; roast: string };

const SYSTEM = `You are the judge of Bid Wars, a two-player party game played on one phone. Two friends bid fake money on hidden items from one topic and each ended up with five. Now both collections are on the table and they are arguing about who has the better one.

Decide who has the better collection purely on how good the items are in the real world: online reviews and ratings, critic and fan consensus, popularity, prestige and how iconic each one is within the topic. Weigh each player's best pick most, then the overall quality of all five. Money is irrelevant: you are not told what anyone paid or has left, and it must not matter.

You must pick a winner. A draw is not allowed. If it is close, decide on the best single pick.

Keep it short and spoken, like a friend at the table. No markdown, no lists, no emojis. Use the players' names.

Reply with JSON only, matching exactly:
{"winner": 0 or 1, "headline": "max 8 words", "reasoning": "2 to 3 sentences that name the specific picks that decided it and why they rate higher", "roast": "one playful sentence aimed at the loser"}`;

export async function judgeCollections(input: JudgeInput): Promise<Verdict> {
  if (!API_KEY) throw new Error('No API key');
  const client = new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
  const fmt = (c: Collected[]) => (c.length ? c.map((x) => x.name).join('; ') : 'nothing');
  const user = [
    `Topic: ${input.topic}`,
    `${input.names[0]} (player 0) collected: ${fmt(input.collections[0])}.`,
    `${input.names[1]} (player 1) collected: ${fmt(input.collections[1])}.`,
  ].join('\n');

  const response = await client.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 600,
    output_config: { effort: 'low' },
    system: SYSTEM,
    messages: [{ role: 'user', content: user }],
  });
  if (response.stop_reason === 'refusal') throw new Error('The judge declined to rule on this one.');
  const text = response.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const v = JSON.parse(json) as Partial<Verdict>;
  // A draw is not allowed; if the model still returns one, fall back to the built-in ranking for the winner.
  const winner: Player = v.winner === 0 || v.winner === 1 ? v.winner : localVerdict(input).winner;
  return { winner, headline: String(v.headline || ''), reasoning: String(v.reasoning || ''), roast: String(v.roast || '') };
}

/** 1 for the pack's best item down to just above 0 for its weakest; unknown names sit in the middle. */
export function quality(name: string, ranked: readonly string[]): number {
  const i = ranked.indexOf(name);
  return i < 0 ? 0.5 : 1 - i / ranked.length;
}

/** How good a collection is: the best pick counts extra on top of every pick's quality. */
export function collectionScore(c: Collected[], ranked: readonly string[]): { total: number; best: number; top: Collected | null } {
  let top: Collected | null = null, best = 0, total = 0;
  for (const x of c) {
    const q = quality(x.name, ranked);
    total += q;
    if (!top || q > best) { top = x; best = q; }
  }
  return { total: total + best * 1.5, best, top };
}

/** Built-in judge: ranks on each pack's consensus order. Never returns a draw; `tiebreak` decides only a perfect tie. */
export function localVerdict(input: JudgeInput, tiebreak: Player = 0): Verdict {
  const [na, nb] = input.names;
  const sa = collectionScore(input.collections[0], input.ranked);
  const sb = collectionScore(input.collections[1], input.ranked);
  let w: Player;
  if (sa.total !== sb.total) w = sa.total > sb.total ? 0 : 1;
  else if (sa.best !== sb.best) w = sa.best > sb.best ? 0 : 1;
  else w = tiebreak;
  const [wn, ln] = w === 0 ? [na, nb] : [nb, na];
  const [ws, ls] = w === 0 ? [sa, sb] : [sb, sa];
  const reasoning = ws.top
    ? `${ws.top.name} is the best-rated pick on the table, and ${wn}'s whole shelf rates higher overall. ${ls.top ? `${ln}'s best was ${ls.top.name}, which reviewers and fans rank lower.` : `${ln} didn't get a single item.`}`
    : `${wn} wins by default: neither collection had much to judge.`;
  return {
    winner: w,
    headline: `${wn} has the better collection`,
    reasoning,
    roast: ws.best - ls.best > 0.4 ? `${ln}, the internet has spoken.` : `${ln}, close, but the reviews don't lie.`,
  };
}
