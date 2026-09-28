import raw from './topics.json';

export type TopicItem = string;

export type Topic = {
  id: string;
  title: string;
  subtitle: string;
  revealTitle: string;
  revealSubtitle: string;
  /** Hex accent used for rendering (React Native has no oklch support). */
  accent: string;
  items: TopicItem[];
  status: 'live' | 'soon';
};

type RawTopic = {
  id: string; title: string; subtitle: string; revealTitle?: string; revealSubtitle?: string;
  accent: string; accentHex: string; status?: string; items: string[];
};

const pack = raw as { version: number; itemsPerRound: number; startingBudget: number; topics: RawTopic[]; comingSoon: string[] };

export const ITEMS_PER_ROUND = pack.itemsPerRound;
export const STARTING_BUDGET = pack.startingBudget;

export const TOPICS: Topic[] = pack.topics.map((t) => ({
  id: t.id,
  title: t.title,
  subtitle: t.subtitle,
  revealTitle: t.revealTitle ?? t.title.toUpperCase(),
  revealSubtitle: t.revealSubtitle ?? t.subtitle,
  accent: t.accentHex,
  items: t.items,
  status: (t.status as Topic['status']) ?? 'live',
}));

export const COMING_SOON: string[] = pack.comingSoon;

export function topicById(id: string): Topic {
  return TOPICS.find((t) => t.id === id) ?? TOPICS[0];
}

/** Mono label used in the auction header, e.g. "FOOD" or "VALORANT · VANDAL SKINS". */
export function topicLabel(t: Topic): string {
  const sub = t.revealSubtitle;
  const subIsTag = sub && sub === sub.toUpperCase() && sub !== t.subtitle;
  return subIsTag ? `${t.revealTitle} · ${sub}` : t.revealTitle;
}
