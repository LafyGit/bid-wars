import { CATALOG, COMING_SOON, GROUPS as GROUP_DEFS, type CategoryDef, type GroupDef } from './catalog';

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

export type TopicGroup = GroupDef & { categories: Category[]; topicCount: number };

/** Groups in display order, with their categories resolved. Categories with no playable subtopic are dropped. */
export const GROUPS: TopicGroup[] = GROUP_DEFS.map((g) => {
  const categories = g.categoryIds.map((id) => CATEGORIES.find((c) => c.id === id)).filter((c): c is Category => !!c && c.topics.length > 0);
  return { ...g, categories, topicCount: categories.reduce((n, c) => n + c.topics.length, 0) };
});

export const TOPICS: Topic[] = CATEGORIES.flatMap((c) => c.topics);

export function groupById(id: string): TopicGroup {
  return GROUPS.find((g) => g.id === id) ?? GROUPS[0];
}

export function groupOfCategory(categoryId: string): TopicGroup {
  return GROUPS.find((g) => g.categories.some((c) => c.id === categoryId)) ?? GROUPS[0];
}

/** Every subtopic in a group, for the "surprise me" row. */
export const topicsInGroup = (g: TopicGroup): Topic[] => g.categories.flatMap((c) => c.topics);

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
