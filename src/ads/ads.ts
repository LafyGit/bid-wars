/** Web and tests: no ads. The native implementation lives in ads.native.ts. */
export async function initAds(): Promise<void> {}
export function setAdsAllowed(_allowed: boolean): void {}
export function rewardedAvailable(): boolean { return false; }
export async function maybeShowInterstitial(): Promise<void> {}
export async function showRewarded(): Promise<boolean> { return false; }
