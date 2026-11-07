import { Platform } from 'react-native';

/**
 * Reporting only: sales show up in RevenueCat beside the other apps'. expo-iap still makes and finishes
 * every purchase, and a failure here never affects one.
 */
type RC = typeof import('react-native-purchases');

/** Public SDK key, made to ship inside the app. */
const REVENUECAT_IOS_KEY = 'appl_PpUHkKnrgMfVoMifOmpFnQGiDQg';

let sdk: RC['default'] | null = null;

export function startRevenueCat(): void {
  if (sdk || __DEV__ || Platform.OS !== 'ios') return;
  try {
    const rc = require('react-native-purchases') as RC;
    rc.default.configure({
      apiKey: REVENUECAT_IOS_KEY,
      purchasesAreCompletedBy: { type: rc.PURCHASES_ARE_COMPLETED_BY_TYPE.MY_APP, storeKitVersion: rc.STOREKIT_VERSION.STOREKIT_2 },
    });
    sdk = rc.default;
  } catch { /* the store keeps working without reporting */ }
}

export function reportPurchase(productId: string): void {
  sdk?.recordPurchase(productId).catch(() => {});
}
