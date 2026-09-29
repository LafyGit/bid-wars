import Anthropic from '@anthropic-ai/sdk';
import type { Collected, Pair, Player } from '../game/types';

/**
 * The judge reads both collections at the end of a round and picks a winner on the QUALITY of what each
 * player collected, especially their best picks. Money left over is deliberately not part of the verdict.
 * It never calls a draw. Advice only: the players still tap the winner.
 *
 * Key: EXPO_PUBLIC_ANTHROPIC_API_KEY (see .env.example). This ships the key inside the app bundle,
 * which is fine for a private TestFlight build; put a small proxy in front of it before a public release.
 */
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
export const judgeAvailable = () => !!API_KEY;

export type JudgeInput = {
  topic: string;
  names: Pair<string>;
  collections: Pair<Collected[]>;
  unclaimed: string[];
};

export type Verdict = { winner: Player; headline: string; reasoning: string; roast: string };

const SYSTEM = `You are the judge of Bid Wars, a two-player party game played on one phone. Two friends bid fake money on hidden items from one topic. Now both collections are on the table and they are arguing about who has the better one.

Decide who has the better collection by the QUALITY of the items: how desirable, iconic, rare or impressive each pick is within the topic, and above all how strong each player's best pick is. Depth matters too, but one standout pick can beat several average ones. Do NOT consider how much money anyone has left. The price paid is only a weak hint; a player who got something great cheaply did well. The "wanted" figure is the highest bid anyone placed on an item, so it shows how contested it was.

You must pick a winner. A draw is not allowed. If it is close, decide on the best single pick, then on overall quality. If one player has no items, the other wins.

Keep it short and spoken, like a friend at the table. No markdown, no lists, no emojis. Use the players' names.

Reply with JSON only, matching exactly:
{"winner": 0 or 1, "headline": "max 8 words", "reasoning": "2 to 3 sentences that name the specific picks that decided it", "roast": "one playful sentence aimed at the loser"}`;

export async function judgeCollections(input: JudgeInput): Promise<Verdict> {
  if (!API_KEY) throw new Error('No API key');
  const client = new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
  const fmt = (c: Collected[]) => (c.length ? c.map((x) => `${x.name} (paid $${x.price}, wanted up to $${x.value})`).join('; ') : 'nothing');
  const user = [
    `Topic: ${input.topic}`,
    `${input.names[0]} (player 0) collected: ${fmt(input.collections[0])}.`,
    `${input.names[1]} (player 1) collected: ${fmt(input.collections[1])}.`,
    input.unclaimed.length ? `Nobody bought: ${input.unclaimed.join(', ')}.` : 'Every item sold.',
  ].join('\n');

  const response = await client.messages.create({
    model: 'claude-opus-5',
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

/** How good a collection looks without a model: demand for what they got, with the best pick counting most. */
export function collectionScore(c: Collected[]): { total: number; best: number } {
  const values = c.map((x) => x.value).sort((a, b) => b - a);
  const best = values[0] ?? 0;
  // Top three picks count fully, the rest at half: quality over quantity.
  const total = values.reduce((s, v, i) => s + (i < 3 ? v : v * 0.5), 0) + best * 1.5;
  return { total, best };
}

/**
 * Offline stand-in when no key is configured. It cannot know which items are truly better, so it uses how
 * contested each item was (the highest bid placed on it) and the best single pick. Money left is ignored.
 * Never returns a draw. `tiebreak` decides only a perfect tie.
 */
export function localVerdict(input: JudgeInput, tiebreak: Player = 0): Verdict {
  const [na, nb] = input.names;
  const sa = collectionScore(input.collections[0]);
  const sb = collectionScore(input.collections[1]);
  let w: Player;
  if (sa.total !== sb.total) w = sa.total > sb.total ? 0 : 1;
  else if (sa.best !== sb.best) w = sa.best > sb.best ? 0 : 1;
  else if (input.collections[0].length !== input.collections[1].length) w = input.collections[0].length > input.collections[1].length ? 0 : 1;
  else w = tiebreak;
  const [wn, ln] = w === 0 ? [na, nb] : [nb, na];
  const wc = input.collections[w], lc = input.collections[1 - w];
  const top = (c: Collected[]) => c.reduce<Collected | null>((m, x) => (!m || x.value > m.value ? x : m), null);
  const wt = top(wc), lt = top(lc);
  const reasoning = wt
    ? `${wn} takes it on the strength of ${wt.name}, the most contested pick of the round${wc.length > 1 ? `, backed up by ${wc.length - 1} more` : ''}. ${lt ? `${ln}'s best was ${lt.name}, which just wasn't enough.` : `${ln} didn't get a single item.`}`
    : `${wn} wins by default: neither collection had much to judge.`;
  return {
    winner: w,
    headline: `${wn} has the better collection`,
    reasoning,
    roast: lc.length === 0 ? `${ln} spent the whole auction watching. Bold strategy.` : `${ln}, quantity isn't quality.`,
  };
}
