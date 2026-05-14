import { Platform } from "react-native";
import MobileAds, {
  MaxAdContentRating,
} from "react-native-google-mobile-ads";

const IS_ANDROID = Platform.OS === "android";

export const AdUnitIds = {
  BANNER: IS_ANDROID
    ? "ca-app-pub-3940256099942544/6300978111"
    : "ca-app-pub-3940256099942544/2934735716",
  INTERSTITIAL: IS_ANDROID
    ? "ca-app-pub-3940256099942544/1033173712"
    : "ca-app-pub-3940256099942544/4411468910",
  REWARDED: IS_ANDROID
    ? "ca-app-pub-3940256099942544/5224354917"
    : "ca-app-pub-3940256099942544/1712485313",
};

export async function initializeAdMob(): Promise<void> {
  await MobileAds().initialize();
  await MobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.PG,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
  });
}
