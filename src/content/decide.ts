/**
 * "Can't decide?" helper. For categories that map to a real-life choice (what to watch, eat, play, visit...),
 * the app offers to pick for you from the packs in that category.
 */
export type DecideCopy = { question: string; cta: string; verb: string };

const COPY: Record<string, DecideCopy> = {
  screen: { question: 'Can’t decide what to watch?', cta: 'Pick something for tonight', verb: 'Watch' },
  hollywood: { question: 'Movie night, no idea what?', cta: 'Pick a movie night', verb: 'Watch' },
  cartoons: { question: 'Want something easy to watch?', cta: 'Pick a cartoon', verb: 'Watch' },
  anime: { question: 'Can’t pick your next anime?', cta: 'Pick something to watch', verb: 'Watch' },
  fantasy: { question: 'Which world are you escaping to?', cta: 'Pick a world', verb: 'Dive into' },
  music: { question: 'No idea what to listen to?', cta: 'Pick something to play', verb: 'Listen to' },
  books: { question: 'What should you read next?', cta: 'Pick a read', verb: 'Read' },
  food: { question: 'Can’t decide what to eat?', cta: 'Pick a meal', verb: 'Eat' },
  sweets: { question: 'Craving something sweet?', cta: 'Pick a treat', verb: 'Have' },
  travel: { question: 'Where should you go next?', cta: 'Pick a destination', verb: 'Go to' },
  world: { question: 'Where in the world next?', cta: 'Pick a place', verb: 'Visit' },
  games: { question: 'What should you play tonight?', cta: 'Pick a game', verb: 'Play' },
  gametypes: { question: 'What should you play tonight?', cta: 'Pick a game', verb: 'Play' },
  nintendo: { question: 'What should you play tonight?', cta: 'Pick a game', verb: 'Play' },
  fps: { question: 'Which shooter tonight?', cta: 'Pick a game', verb: 'Play' },
  fitness: { question: 'No idea how to train today?', cta: 'Pick a workout', verb: 'Try' },
  life: { question: 'Stuck on a decision?', cta: 'Let the app pick', verb: 'Go with' },
};

export const decideCopy = (categoryId: string): DecideCopy | null => COPY[categoryId] ?? null;

export type SuggestPool = { title: string; items: readonly string[] }[];
export type Suggestion = { item: string; from: string };

/** Pick one item from a random pack in the pool, avoiding anything in `exclude` when possible. */
export function suggest(pool: SuggestPool, exclude: readonly string[] = [], rand: () => number = Math.random): Suggestion | null {
  const all = pool.flatMap((p) => p.items.map((item) => ({ item, from: p.title })));
  if (!all.length) return null;
  const skip = new Set(exclude.map((e) => e.toLowerCase()));
  const fresh = all.filter((a) => !skip.has(a.item.toLowerCase()));
  const from = fresh.length ? fresh : all;
  // Choose the pack first so small packs get a fair share, then an item within it.
  const packs = Array.from(new Set(from.map((f) => f.from)));
  const pack = packs[Math.floor(rand() * packs.length)];
  const inPack = from.filter((f) => f.from === pack);
  return inPack[Math.floor(rand() * inPack.length)];
}
