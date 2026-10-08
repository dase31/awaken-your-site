import { Capacitor } from "@capacitor/core";

// Runs once at startup. Everything here is a no-op in a normal browser, so
// the website is unaffected.
export async function initNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  // iOS zooms the page when you focus an input with text smaller than 16px.
  // A fixed-scale viewport stops that in the app (the website keeps zoom,
  // which matters for accessibility).
  const viewport = document.querySelector('meta[name="viewport"]');
  viewport?.setAttribute(
    "content",
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
  );

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    // Our skies are blue with white text, so the clock and battery need to be light.
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    /* plugin unavailable — not fatal */
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* ignore */
  }
}
