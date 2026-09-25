import { TestIds } from 'react-native-google-mobile-ads';

/**
 * TODO before release: replace with real ad unit IDs from your AdMob account
 * (one set per platform, created after the app is added to AdMob).
 * __DEV__ always uses Google's test IDs so development never serves real ads.
 */
export const BANNER_AD_UNIT_ID = __DEV__ ? TestIds.BANNER : 'ca-app-pub-REPLACE_ME/BANNER_UNIT_ID';
