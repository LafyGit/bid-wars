/** How many item names to remember. Large enough that a pack is rarely repeated within an evening. */
export const SEEN_LIMIT = 600;
/** How many recently played topics Random steers away from. */
export const RECENT_TOPICS = 10;

const norm = (s: string) => s.trim().toLowerCase();

function shuffled<T>(arr: readonly T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `n` items from `pool`, preferring ones not in `seen` (oldest first in the history array).
 * If the pool is mostly seen, the least recently seen items fill the gap. Names are compared across packs,
 * so the same name showing up in two packs also counts as seen. Returns the picks and the new history.
 */
export function pickItems(pool: readonly string[], n: number, seen: readonly string[], rand: () => number = Math.random): { items: string[]; seen: string[] } {
  const seenIndex = new Map<string, number>();
  seen.forEach((s, i) => seenIndex.set(s, i)); // later index = more recent
  const fresh = shuffled(pool.filter((p) => !seenIndex.has(norm(p))), rand);
  let items = fresh.slice(0, n);
  if (items.length < n) {
    const stale = pool
      .filter((p) => seenIndex.has(norm(p)))
      .sort((a, b) => (seenIndex.get(norm(a)) ?? 0) - (seenIndex.get(norm(b)) ?? 0)); // least recent first
    items = items.concat(stale.slice(0, n - items.length));
  }
  items = shuffled(items, rand);
  const picked = new Set(items.map(norm));
  const next = seen.filter((s) => !picked.has(s)).concat(items.map(norm));
  return { items, seen: next.slice(-SEEN_LIMIT) };
}

/** Choose a random topic id, avoiding the recently played ones when there is any alternative. */
export function pickTopicId(ids: readonly string[], recent: readonly string[], rand: () => number = Math.random): string {
  const avoid = new Set(recent.slice(-RECENT_TOPICS));
  const open = ids.filter((id) => !avoid.has(id));
  const from = open.length ? open : ids;
  return from[Math.floor(rand() * from.length)];
}

export const remember = (recent: readonly string[], id: string): string[] => recent.filter((r) => r !== id).concat(id).slice(-60);
