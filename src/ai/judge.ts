import Anthropic from '@anthropic-ai/sdk';
import type { Collected, Pair } from '../game/types';

/**
 * The AI judge reads both collections at the end of a round and gives a short, opinionated verdict.
 * It is advice only: the players still tap the winner.
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
  budgets: Pair<number>;
  unclaimed: string[];
};

export type Verdict = { winner: 0 | 1 | -1; headline: string; reasoning: string; roast: string };

const SYSTEM = `You are the judge of Bid Wars, a two-player party game played on one phone. Each player started with $20 and bid on 10 hidden items from one topic. Now both collections are on the table and the players are arguing about who won.

Give a fun, confident verdict. Judge the collections on taste and value for money in that topic, not just on count. Pick a winner unless it is genuinely a coin flip. Keep it short and spoken, like a friend at the table. No markdown, no lists, no emojis. Use the players' names.

Reply with JSON only, matching exactly:
{"winner": 0 or 1 or -1 for a draw, "headline": "max 8 words", "reasoning": "2 to 3 sentences", "roast": "one playful sentence aimed at the loser (or both on a draw)"}`;

export async function judgeCollections(input: JudgeInput): Promise<Verdict> {
  if (!API_KEY) throw new Error('No API key');
  const client = new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
  const fmt = (c: Collected[]) => (c.length ? c.map((x) => `${x.name} ($${x.price})`).join(', ') : 'nothing');
  const user = [
    `Topic: ${input.topic}`,
    `${input.names[0]} won: ${fmt(input.collections[0])}. Money left: $${input.budgets[0]}.`,
    `${input.names[1]} won: ${fmt(input.collections[1])}. Money left: $${input.budgets[1]}.`,
    input.unclaimed.length ? `Nobody bought: ${input.unclaimed.join(', ')}.` : 'Every item sold.',
    `Player index: ${input.names[0]} = 0, ${input.names[1]} = 1.`,
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
  const v = JSON.parse(json) as Verdict;
  const winner = v.winner === 0 || v.winner === 1 ? v.winner : -1;
  return { winner, headline: String(v.headline || ''), reasoning: String(v.reasoning || ''), roast: String(v.roast || '') };
}

/** Offline stand-in when no key is configured: judges on count, spend and a bit of attitude. */
export function localVerdict(input: JudgeInput): Verdict {
  const [a, b] = input.collections;
  const [na, nb] = input.names;
  const spend = (c: Collected[]) => c.reduce((s, x) => s + x.price, 0);
  const score = (c: Collected[], left: number) => c.length * 3 + Math.min(left, 6) - spend(c) * 0.25;
  const sa = score(a, input.budgets[0]), sb = score(b, input.budgets[1]);
  if (a.length === b.length && Math.abs(sa - sb) < 1) {
    return { winner: -1, headline: 'Dead even. Argue it out.', reasoning: `${na} and ${nb} both walked away with ${a.length} items and nearly identical value. The table is split, so the judge is too.`, roast: 'Neither of you outbid the other by enough to brag about it.' };
  }
  const w = sa >= sb ? 0 : 1;
  const [wn, ln] = w === 0 ? [na, nb] : [nb, na];
  const wc = input.collections[w], lc = input.collections[1 - w];
  const best = wc.reduce((m, x) => (x.price >= m.price ? x : m), wc[0]);
  return {
    winner: w,
    headline: `${wn} takes it`,
    reasoning: `${wn} built the better shelf: ${wc.length} item${wc.length === 1 ? '' : 's'} for $${spend(wc)}, headlined by ${best ? best.name : 'nothing'}. ${ln} finished with ${lc.length} item${lc.length === 1 ? '' : 's'} and $${input.budgets[1 - w]} unspent, which is money that could have bought a better collection.`,
    roast: lc.length === 0 ? `${ln} spent the whole auction watching. Bold strategy.` : `${ln}, saving money is not a collection.`,
  };
}
