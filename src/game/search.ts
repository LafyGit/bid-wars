/** The fields search reads: a pack's name and its category's. */
type Named = { title: string; categoryTitle: string };

/** Lowercase, accents and punctuation stripped, so "pokemon" finds "Pokémon" and "spiderman" finds "Spider-Man". */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

/**
 * Packs whose name or category matches every word of `query` (each word a prefix of a name word, or a
 * plain substring of the joined name). Pack-name hits first. Never searches items: they stay secret.
 */
export function searchTopics<T extends Named>(topics: T[], query: string, limit = 40): T[] {
  const words = norm(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  const hits = (text: string) => {
    const n = norm(text);
    const parts = n.split(' ');
    const squashed = n.replace(/ /g, '');
    return words.every((w) => parts.some((p) => p.startsWith(w)) || squashed.includes(w));
  };
  const byTitle = topics.filter((t) => hits(t.title));
  const byCategory = topics.filter((t) => !byTitle.includes(t) && hits(`${t.categoryTitle} ${t.title}`));
  return [...byTitle, ...byCategory].slice(0, limit);
}
