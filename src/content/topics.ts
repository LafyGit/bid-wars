import { CATALOG, COMING_SOON, type CategoryDef } from './catalog';

export { COMING_SOON };

export type Topic = {
  /** Subtopic id, e.g. "valorant-knives" */
  id: string;
  categoryId: string;
  categoryTitle: string;
  title: string;
  subtitle: string;
  accent: string;
  items: string[];
};

export type Category = CategoryDef & { topics: Topic[] };

export const ITEMS_PER_ROUND = 10;
export const STARTING_BUDGET = 20;

export const CATEGORIES: Category[] = CATALOG.map((c) => ({
  ...c,
  topics: c.subtopics
    .filter((s) => s.items.length >= ITEMS_PER_ROUND)
    .map((s) => ({ id: s.id, categoryId: c.id, categoryTitle: c.title, title: s.title, subtitle: s.subtitle, accent: c.accent, items: s.items })),
}));

export const TOPICS: Topic[] = CATEGORIES.flatMap((c) => c.topics);

export function topicById(id: string): Topic {
  return TOPICS.find((t) => t.id === id) ?? TOPICS[0];
}

export function categoryById(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

/** Mono label used in the auction header, e.g. "VALORANT · KNIFE SKINS". */
export function topicLabel(t: Topic): string {
  return `${t.categoryTitle} · ${t.title}`.toUpperCase();
}

export const randomTopic = () => TOPICS[Math.floor(Math.random() * TOPICS.length)];
