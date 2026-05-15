import { Platform } from "react-native";
import UnityAds from "@mrnitrox/react-native-unity-ads-monetization";

export const UNITY_GAME_ID = "6115331";

export const PlacementIds = {
  INTERSTITIAL: Platform.OS === "ios" ? "Interstitial_iOS" : "Interstitial_Android",
  SAVE_BUTTON: "Save-button",
  REWARDED: Platform.OS === "ios" ? "Rewarded_iOS" : "Rewarded_Android",
  TIMED: "through_the_app",
};

export async function initializeUnityAds(): Promise<void> {
  try {
    await UnityAds.initialize(UNITY_GAME_ID, __DEV__);
  } catch (e) {
    console.warn("[Unity Ads] Initialization failed:", e);
  }
}

export async function loadInterstitial(): Promise<void> {
  try {
    await UnityAds.loadAd(PlacementIds.INTERSTITIAL);
  } catch (e) {
    console.warn("[Unity Ads] Load interstitial failed:", e);
  }
}

export async function showInterstitial(): Promise<void> {
  try {
    const ready = await UnityAds.isLoad(PlacementIds.INTERSTITIAL);
    if (ready) {
      await UnityAds.showAd(PlacementIds.INTERSTITIAL);
    }
  } catch (e) {
    console.warn("[Unity Ads] Show interstitial failed:", e);
  }
}

export async function loadSaveButtonAd(): Promise<void> {
  try {
    await UnityAds.loadAd(PlacementIds.SAVE_BUTTON);
  } catch (e) {
    console.warn("[Unity Ads] Load save-button ad failed:", e);
  }
}

export async function showSaveButtonAd(): Promise<void> {
  try {
    const ready = await UnityAds.isLoad(PlacementIds.SAVE_BUTTON);
    if (ready) {
      await UnityAds.showAd(PlacementIds.SAVE_BUTTON);
    }
  } catch (e) {
    console.warn("[Unity Ads] Show save-button ad failed:", e);
  }
}

export async function loadTimedAd(): Promise<void> {
  try {
    await UnityAds.loadAd(PlacementIds.TIMED);
  } catch (e) {
    console.warn("[Unity Ads] Load timed ad failed:", e);
  }
}

export async function showTimedAd(): Promise<void> {
  try {
    const ready = await UnityAds.isLoad(PlacementIds.TIMED);
    if (ready) {
      await UnityAds.showAd(PlacementIds.TIMED);
    }
  } catch (e) {
    console.warn("[Unity Ads] Show timed ad failed:", e);
  }
}

export async function loadRewarded(): Promise<void> {
  try {
    await UnityAds.loadAd(PlacementIds.REWARDED);
  } catch (e) {
    console.warn("[Unity Ads] Load rewarded failed:", e);
  }
}

export async function showRewarded(
  onComplete?: (state: "SKIPPED" | "COMPLETED") => void
): Promise<void> {
  try {
    const ready = await UnityAds.isLoad(PlacementIds.REWARDED);
    if (!ready) return;

    if (onComplete) {
      UnityAds.setOnUnityAdsShowListener({
        onShowStart: () => {},
        onShowComplete: (_id, state) => onComplete(state),
        onShowFailed: () => {},
        onShowClick: () => {},
      });
    }
    await UnityAds.showAd(PlacementIds.REWARDED);
  } catch (e) {
    console.warn("[Unity Ads] Show rewarded failed:", e);
  }
}

export default UnityAds;
