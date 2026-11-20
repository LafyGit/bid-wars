import { CATALOG } from '../content/catalog.ts';
import { CUSTOM_CATEGORY } from '../content/custom.ts';

/** The only Topic fields entitlements need. */
type HasCategory = { id: string; categoryId: string };

/** App Store product ids. Create these in App Store Connect as non-consumable in-app purchases. */
export const BUNDLE = 'com.lafyalmutlaq.bidwars';
export const PRO_ID = `${BUNDLE}.pro`;
export const groupProductId = (groupId: string) => `${BUNDLE}.pack.${groupId}`;

/**
 * Group packs sold before Pro-only (1.0.0) and the Pro packs each one unlocked then. Frozen: the topic
 * screen's sections have changed since, but what a player bought must not. sports and foodtravel held no
 * Pro packs, so they only remove ads.
 */
export const LEGACY_GROUP_PACKS: Record<string, readonly string[]> = {
  gaming: ['cs2-knives', 'cs2-ak', 'cs2-awp', 'cs2-maps', 'cs2-legends', 'cs2-teams', 'cs2-weapons', 'cs2-gloves', 'league-champs', 'league-skins', 'league-pros', 'league-regions', 'league-items', 'league-arcane', 'games-indie', 'games-retro', 'games-boardgames', 'games-sims', 'games-rpg', 'games-platformers'],
  sports: [],
  entertainment: ['creators-youtube', 'creators-streamers', 'esports-games', 'esports-events', 'creators-tiktok', 'memes', 'emojis', 'internet-viral', 'book-series', 'book-authors', 'book-classics', 'book-manga', 'book-kids', 'myths-greek', 'myths-norse', 'myths-egypt', 'myths-monsters', 'myths-heroes', 'myths-arabian', 'myths-relics'],
  foodtravel: [],
  lifestyle: ['lux-yachts', 'lux-jets', 'lux-hotels', 'lux-jewelry', 'lux-hoods', 'gym-exercises', 'gym-styles', 'gym-brands', 'apps-social', 'apps-streaming', 'apps-ai', 'apps-daily', 'apps-sites', 'apps-features'],
};
export const ALL_PRODUCT_IDS: string[] = [PRO_ID, ...Object.keys(LEGACY_GROUP_PACKS).map(groupProductId)];

/** Product ids the player owns. */
export type Owned = readonly string[];

export const ownsPro = (owned: Owned) => owned.includes(PRO_ID);

const legacyOwnsPack = (owned: Owned, packId: string) =>
  Object.entries(LEGACY_GROUP_PACKS).some(([g, packs]) => packs.includes(packId) && owned.includes(groupProductId(g)));

/** Custom packs everyone can keep; Pro has no limit. */
export const FREE_CUSTOM_PACKS = 1;
export const customPackLimit = (owned: Owned) => (ownsPro(owned) ? Infinity : FREE_CUSTOM_PACKS);
export const canAddCustomPack = (owned: Owned, count: number) => count < customPackLimit(owned);

/**
 * A pack is playable if its category is free, the player has Pro, or an old group pack covered it.
 * Custom packs always play: the limit applies to making them, so a refunded Pro never locks a saved pack.
 */
export function topicUnlocked(t: HasCategory, owned: Owned): boolean {
  if (t.categoryId === CUSTOM_CATEGORY) return true;
  const cat = CATALOG.find((c) => c.id === t.categoryId);
  if (!cat) return false;
  return cat.free || ownsPro(owned) || legacyOwnsPack(owned, t.id);
}

/** A category tile opens if any pack in it is playable; the packs screen then gates each pack. */
export function categoryUnlocked(categoryId: string, owned: Owned): boolean {
  const cat = CATALOG.find((c) => c.id === categoryId);
  if (!cat) return false;
  return cat.subtopics.some((s) => topicUnlocked({ id: s.id, categoryId }, owned));
}

/** Everything the player can play right now. */
export const playableTopics = <T extends HasCategory>(all: T[], owned: Owned): T[] => all.filter((t) => topicUnlocked(t, owned));
