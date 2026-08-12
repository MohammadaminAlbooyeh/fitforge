import { Platform } from 'react-native';

import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const APPLE_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

export function isRevenueCatConfigured(): boolean {
  return Boolean(Platform.OS === 'android' ? ANDROID_API_KEY : APPLE_API_KEY);
}

export async function configurePurchases(
  appUserId?: number | null,
): Promise<boolean> {
  const apiKey = Platform.OS === 'android' ? ANDROID_API_KEY : APPLE_API_KEY;
  if (!apiKey) {
    return false;
  }
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({
    apiKey,
    appUserID: appUserId != null ? String(appUserId) : undefined,
  });
  if (appUserId != null) {
    await Purchases.logIn(String(appUserId));
  }
  return true;
}

export async function purchaseProOffering(
  appUserId?: number | null,
): Promise<string> {
  await configurePurchases(appUserId);
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  const pkg = current?.annual ?? current?.monthly ?? current?.lifetime;
  if (!pkg) {
    throw new Error('No Pro package is available for purchase');
  }
  await Purchases.purchasePackage(pkg);
  return pkg.product.identifier;
}

export async function restorePurchases(appUserId?: number | null): Promise<void> {
  await configurePurchases(appUserId);
  await Purchases.restorePurchases();
}