import { Platform } from 'react-native';
import { ALL_PRODUCT_IDS } from './entitlements';

/**
 * Thin wrapper over StoreKit (expo-iap). Everything is non-consumable, so ownership is simply the set of
 * product ids the store reports. Expo Go, web and simulators without a StoreKit config report "unavailable"
 * and the game keeps working with the free packs.
 */
export type StoreStatus = 'loading' | 'ready' | 'unavailable';
export type ProductInfo = { id: string; price: string; title: string };

export type StoreHandlers = {
  onOwned: (ids: string[]) => void;
  onProducts: (products: Record<string, ProductInfo>) => void;
  onStatus: (status: StoreStatus) => void;
  onMessage: (message: string | null) => void;
};

type IAP = typeof import('expo-iap');
let iap: IAP | null = null;
let handlers: StoreHandlers | null = null;
let subs: { remove: () => void }[] = [];
let devStore = false;

const loadIAP = (): IAP | null => {
  if (Platform.OS !== 'ios') return null;
  try { return require('expo-iap') as IAP; } catch { return null; }
};

async function refreshOwned() {
  if (!iap || !handlers) return;
  const purchases = await iap.getAvailablePurchases();
  const ids = Array.from(new Set((purchases as { productId: string }[]).map((p) => p.productId))).filter((id) => ALL_PRODUCT_IDS.includes(id));
  handlers.onOwned(ids);
}

/** Connect to the store, load prices and ownership. Safe to call more than once. */
export async function startStore(h: StoreHandlers): Promise<void> {
  handlers = h;
  iap = loadIAP();
  if (!iap) {
    if (__DEV__) {
      // Development only (Expo Go / simulator without StoreKit): a fake store so the whole flow can be tried.
      const fake: Record<string, ProductInfo> = {};
      ALL_PRODUCT_IDS.forEach((id) => { fake[id] = { id, price: id.endsWith('.pro') ? '$7.99' : '$2.99', title: id }; });
      h.onProducts(fake); h.onStatus('ready'); devStore = true; return;
    }
    h.onStatus('unavailable'); return;
  }
  try {
    await iap.initConnection();
  } catch {
    h.onStatus('unavailable'); return;
  }
  subs.forEach((s) => s.remove());
  subs = [
    iap.purchaseUpdatedListener(async (purchase) => {
      const id = (purchase as { productId: string }).productId;
      if (!ALL_PRODUCT_IDS.includes(id)) return;
      try {
        await iap!.finishTransaction({ purchase, isConsumable: false });
      } catch { /* the transaction replays on next launch */ }
      handlers?.onOwned([id]);
      handlers?.onMessage(null);
    }),
    iap.purchaseErrorListener((error) => {
      const code = (error as { code?: string }).code;
      // Cancelling is not an error worth shouting about.
      handlers?.onMessage(code === 'user-cancelled' ? null : 'The purchase did not go through. You have not been charged.');
    }),
  ];
  try {
    const products = (await iap.fetchProducts({ skus: ALL_PRODUCT_IDS, type: 'in-app' })) as { id: string; displayPrice: string; title: string }[] | null;
    const map: Record<string, ProductInfo> = {};
    (products ?? []).forEach((p) => { map[p.id] = { id: p.id, price: p.displayPrice, title: p.title }; });
    h.onProducts(map);
    h.onStatus(Object.keys(map).length ? 'ready' : 'unavailable');
  } catch {
    h.onStatus('unavailable');
  }
  try { await refreshOwned(); } catch { /* keep the cached entitlements */ }
}

export async function buy(productId: string): Promise<void> {
  if (__DEV__ && devStore && handlers) { setTimeout(() => handlers?.onOwned([productId]), 600); return; }
  if (!iap || !handlers) { handlers?.onMessage('The store is not available right now.'); return; }
  handlers.onMessage(null);
  try {
    await iap.requestPurchase({ request: { apple: { sku: productId }, google: { skus: [productId] } }, type: 'in-app' });
  } catch (e) {
    const code = (e as { code?: string }).code;
    handlers.onMessage(code === 'user-cancelled' ? null : 'The purchase did not go through. You have not been charged.');
  }
}

export async function restore(): Promise<void> {
  if (__DEV__ && devStore && handlers) { handlers.onMessage('Dev store: nothing to restore.'); return; }
  if (!iap || !handlers) { handlers?.onMessage('The store is not available right now.'); return; }
  handlers.onMessage(null);
  try {
    await iap.restorePurchases();
    await refreshOwned();
    handlers.onMessage('Purchases restored.');
  } catch {
    handlers.onMessage('Could not restore purchases. Check your connection and try again.');
  }
}
