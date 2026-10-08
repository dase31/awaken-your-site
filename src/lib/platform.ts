import { Capacitor } from "@capacitor/core";
import { SITE_URL } from "@/lib/config";

export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

// Where the emailed sign-in link should send people back to.
// On the web that's wherever they are now; in the iOS app the "origin" is
// capacitor://localhost, which can't be opened from an email, so use the
// public site instead. (In-app sign-in uses the 6-digit code, so the link
// is only a fallback there.)
export function authRedirectUrl(): string {
  const origin = isNativeApp() ? SITE_URL : window.location.origin;
  return `${origin}/auth/callback`;
}
