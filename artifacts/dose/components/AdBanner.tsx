import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { AdUnitIds } from "@/services/admob";

interface AdBannerProps {
  size?: BannerAdSize;
}

export default function AdBanner({
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
}: AdBannerProps) {
  if (Platform.OS === "web") {
    return null;
  }

  const adUnitId = __DEV__ ? TestIds.BANNER : AdUnitIds.BANNER;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
});
