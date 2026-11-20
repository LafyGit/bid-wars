import type { Topic } from './topics';

/** A pack the players typed themselves. Saved on this phone only, never sent anywhere. */
export type CustomPack = { id: string; title: string; items: string[]; accent: string };

export const CUSTOM_CATEGORY = 'custom';
export const CUSTOM_CATEGORY_TITLE = 'Your Pack';
/** Colour of the Your Packs entry, list and editor. */
export const CUSTOM_ACCENT = '#4FE0C0';
/** A round draws 10 items (ITEMS_PER_ROUND in topics.ts, kept apart so node tests can load this file). */
export const MIN_ITEMS = 10;
export const MAX_ITEMS = 40;
export const TITLE_MAX = 24;
export const ITEM_MAX = 40;
/** Longest word that still fits the cards and collection lists (the catalog's longest is 18, Pachycephalosaurus). */
export const WORD_MAX = 18;

/** Packs take turns through these accents so neighbours never match. */
const ACCENTS = ['#FF6B6B', '#4FE0C0', '#FFCB05', '#B27BE6', '#5AC8FA', '#FF8C42', '#C77DFF', '#39FF6A'];
export const accentFor = (n: number) => ACCENTS[((n % ACCENTS.length) + ACCENTS.length) % ACCENTS.length];

export const isCustomId = (id: string) => id.startsWith('custom-');
export const newPackId = (now = Date.now(), rand = Math.random) => `custom-${now.toString(36)}${Math.floor(rand() * 1e6).toString(36)}`;

const tidy = (s: string) => s.replace(/\s+/g, ' ').trim();

export const cleanTitle = (s: string) => tidy(s).slice(0, TITLE_MAX);

/** One item per line, in the player's order (best first). Blank lines and repeats are dropped, long lines cut. */
export function cleanItems(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const item = tidy(line).slice(0, ITEM_MAX).trim();
    const key = item.toLowerCase();
    if (!item || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length === MAX_ITEMS) break;
  }
  return out;
}

/** First word in the pack too long to fit the cards, or null. */
export const longWord = (title: string, items: readonly string[]): string | null =>
  [title, ...items].flatMap((x) => x.split(' ')).find((w) => w.length > WORD_MAX) ?? null;

/** What is still missing before the pack can be saved, or null when it is ready. */
export function packProblem(title: string, items: readonly string[]): string | null {
  if (!cleanTitle(title)) return 'Give it a name';
  if (items.length < MIN_ITEMS) return `Add ${MIN_ITEMS - items.length} more`;
  if (longWord(title, items)) return 'Shorten a long word';
  return null;
}

/** Saved data can be stale or hand-edited; keep only packs that can still be played. */
export function validPacks(raw: unknown): CustomPack[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((p, i) => {
    if (!p || typeof p.id !== 'string' || !isCustomId(p.id) || typeof p.title !== 'string' || !Array.isArray(p.items)) return [];
    const items = cleanItems(p.items.filter((x: unknown) => typeof x === 'string').join('\n'));
    const title = cleanTitle(p.title);
    if (!title || items.length < MIN_ITEMS) return [];
    return [{ id: p.id, title, items, accent: typeof p.accent === 'string' ? p.accent : accentFor(i) }];
  });
}

export const customTopic = (p: CustomPack): Topic => ({
  id: p.id,
  categoryId: CUSTOM_CATEGORY,
  categoryTitle: CUSTOM_CATEGORY_TITLE,
  title: p.title,
  subtitle: `${p.items.length} items`,
  accent: p.accent,
  items: p.items,
});
