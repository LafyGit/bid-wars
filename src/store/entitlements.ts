import { CATALOG, GROUPS } from '../content/catalog.ts';

/** The only Topic fields entitlements need. */
type HasCategory = { categoryId: string };

const groupIdOfCategory = (categoryId: string) => GROUPS.find((g) => g.categoryIds.includes(categoryId))?.id ?? '';

/** App Store product ids. Create these in App Store Connect as non-consumable in-app purchases. */
export const BUNDLE = 'com.lafyalmutlaq.bidwars';
export const PRO_ID = `${BUNDLE}.pro`;
export const groupProductId = (groupId: string) => `${BUNDLE}.pack.${groupId}`;
export const ALL_PRODUCT_IDS: string[] = [PRO_ID, ...GROUPS.map((g) => groupProductId(g.id))];

/** Product ids the player owns. */
export type Owned = readonly string[];

export const ownsPro = (owned: Owned) => owned.includes(PRO_ID);
export const ownsGroup = (owned: Owned, groupId: string) => ownsPro(owned) || owned.includes(groupProductId(groupId));

/** A category is playable if it is free or its group (or Pro) is owned. */
export function categoryUnlocked(categoryId: string, owned: Owned): boolean {
  const cat = CATALOG.find((c) => c.id === categoryId);
  if (!cat) return false;
  return cat.free || ownsGroup(owned, groupIdOfCategory(categoryId));
}

export const topicUnlocked = (t: HasCategory, owned: Owned) => categoryUnlocked(t.categoryId, owned);

/** Everything the player can play right now. */
export const playableTopics = <T extends HasCategory>(all: T[], owned: Owned): T[] => all.filter((t) => topicUnlocked(t, owned));
