import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';
import mobileAds from 'react-native-google-mobile-ads';

/**
 * Runs Google's UMP flow: required for EEA/UK users before showing personalized ads.
 * Shows the consent form only when Google determines it's needed (e.g. EEA); a no-op elsewhere.
 */
export async function requestAdsConsent(): Promise<void> {
  const { status } = await AdsConsent.requestInfoUpdate();

  if (
    status === AdsConsentStatus.REQUIRED ||
    status === AdsConsentStatus.UNKNOWN
  ) {
    await AdsConsent.loadAndShowConsentFormIfRequired();
  }

  await mobileAds().initialize();
}
