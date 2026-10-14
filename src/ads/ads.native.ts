import { Platform } from 'react-native';
import mobileAds, { AdEventType, AdsConsent, AdsConsentPrivacyOptionsRequirementStatus, InterstitialAd, MaxAdContentRating, RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { AD_UNITS, FREE_ROUNDS_BEFORE_ADS, MIN_SECONDS_BETWEEN_INTERSTITIALS } from './config';

/**
 * Ads: an interstitial between rounds and an opt-in rewarded ad that lets a player try one locked pack.
 * Any purchase turns ads off. Consent (UMP, for GDPR regions) is gathered first, then Apple's tracking
 * prompt; declining either still shows ads, just non-personalised ones.
 */
const units = AD_UNITS[Platform.OS === 'ios' ? 'ios' : 'android'];
const interstitialId = __DEV__ ? TestIds.INTERSTITIAL : units.interstitial;
const rewardedId = __DEV__ ? TestIds.REWARDED : units.rewarded;

let started = false;
let privacyOptions = false;
let allowed = true;
let canRequest = false;
let personalised = false;
let roundsSeen = 0;
let lastShownAt = 0;

let interstitial: InterstitialAd | null = null;
let interstitialReady = false;
let rewarded: RewardedAd | null = null;
let rewardedReady = false;

const request = () => ({ requestNonPersonalizedAdsOnly: !personalised });

function loadInterstitial() {
  if (!interstitialId || !canRequest || !allowed) return;
  interstitialReady = false;
  interstitial = InterstitialAd.createForAdRequest(interstitialId, request());
  interstitial.addAdEventListener(AdEventType.LOADED, () => { interstitialReady = true; });
  interstitial.addAdEventListener(AdEventType.ERROR, () => { interstitialReady = false; });
  interstitial.load();
}

function loadRewarded() {
  if (!rewardedId || !canRequest || !allowed) return;
  rewardedReady = false;
  rewarded = RewardedAd.createForAdRequest(rewardedId, request());
  rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => { rewardedReady = true; });
  rewarded.addAdEventListener(AdEventType.ERROR, () => { rewardedReady = false; });
  rewarded.load();
}

export async function initAds(): Promise<void> {
  if (started || (!interstitialId && !rewardedId)) return;
  started = true;
  try {
    const consent = await AdsConsent.gatherConsent().catch(() => AdsConsent.getConsentInfo());
    canRequest = consent.canRequestAds;
    privacyOptions = consent.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
    if (!canRequest) return;
    if (Platform.OS === 'ios') {
      const current = await getTrackingPermissionsAsync();
      const result = current.status === 'undetermined' ? await requestTrackingPermissionsAsync() : current;
      personalised = result.granted;
    } else {
      personalised = true;
    }
    await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.G, tagForChildDirectedTreatment: false });
    await mobileAds().initialize();
    loadInterstitial();
    loadRewarded();
  } catch {
    // Ads are optional; the game never waits on them.
  }
}

/** Turn ads off for players who bought anything. */
export function setAdsAllowed(value: boolean) {
  allowed = value;
  if (value && started) { if (!interstitialReady) loadInterstitial(); if (!rewardedReady) loadRewarded(); }
}

export function rewardedAvailable() { return allowed && rewardedReady; }

/** Called at the natural break after a round. Resolves when the ad closes, or at once if none is shown. */
export function maybeShowInterstitial(): Promise<void> {
  roundsSeen += 1;
  const now = Date.now();
  if (!allowed || !interstitialReady || !interstitial || roundsSeen <= FREE_ROUNDS_BEFORE_ADS || now - lastShownAt < MIN_SECONDS_BETWEEN_INTERSTITIALS * 1000) {
    return Promise.resolve();
  }
  const ad = interstitial;
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (done) return; done = true; lastShownAt = Date.now(); loadInterstitial(); resolve(); };
    ad.addAdEventListener(AdEventType.CLOSED, finish);
    ad.addAdEventListener(AdEventType.ERROR, finish);
    ad.show().catch(finish);
  });
}

/** Shows the rewarded ad. Resolves true only if the player watched long enough to earn the reward. */
export function showRewarded(): Promise<boolean> {
  if (!allowed || !rewardedReady || !rewarded) return Promise.resolve(false);
  const ad = rewarded;
  return new Promise((resolve) => {
    let earned = false;
    let done = false;
    const finish = () => { if (done) return; done = true; loadRewarded(); resolve(earned); };
    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => { earned = true; });
    ad.addAdEventListener(AdEventType.CLOSED, finish);
    ad.addAdEventListener(AdEventType.ERROR, finish);
    ad.show().catch(finish);
  });
}

/** EEA/UK/Swiss players must be able to change their ad consent later (Settings › Privacy choices). */
export function privacyOptionsRequired() { return privacyOptions; }
export async function openPrivacyOptions(): Promise<void> {
  try { await AdsConsent.showPrivacyOptionsForm(); } catch {}
}
