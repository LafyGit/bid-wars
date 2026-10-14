/**
 * AdMob ad unit IDs. Leave a unit empty and that ad simply never shows in release builds.
 * Debug builds always use Google's test units, so nobody taps a real ad while developing.
 *
 * Also replace the Google *test* app IDs in app.json (react-native-google-mobile-ads plugin:
 * iosAppId / androidAppId) with the real AdMob app IDs before shipping ads.
 */
export const AD_UNITS = {
  // AdMob app: ca-app-pub-2044567614750879~2583837206 (Bid Wars: Blind Auction, iOS)
  ios: { interstitial: 'ca-app-pub-2044567614750879/1581001869', rewarded: 'ca-app-pub-2044567614750879/1270755531' },
  android: { interstitial: '', rewarded: '' },
};

/** Skip ads for a new player's first finished rounds, and never show interstitials closer together than this. */
export const FREE_ROUNDS_BEFORE_ADS = 1;
export const MIN_SECONDS_BETWEEN_INTERSTITIALS = 150;
