import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

// Push exists only in the iOS app. Everything here is a no-op in a browser.
const TOKEN_KEY = "thymos_push_token";

const readToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
const writeToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* private mode: nothing to remember */ }
};

export const pushAvailable = (): boolean => Capacitor.isNativePlatform();

async function saveToken(token: string) {
  writeToken(token);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return; // registered again after sign-in by syncPushRegistration
  const { error } = await supabase.rpc("register_push_token", { p_token: token, p_platform: "ios" });
  if (error) console.error("Couldn't save push token:", error);
}

export type PushResult = "granted" | "denied" | "unavailable";

/** Asks iOS for permission (the system prompt appears once) and registers this device. */
export async function enablePush(): Promise<PushResult> {
  if (!pushAvailable()) return "unavailable";
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    let status = await PushNotifications.checkPermissions();
    if (status.receive === "prompt" || status.receive === "prompt-with-rationale") {
      status = await PushNotifications.requestPermissions();
    }
    if (status.receive !== "granted") return "denied";

    await PushNotifications.register();
    return "granted";
  } catch (error) {
    console.error("Push setup failed:", error);
    return "unavailable";
  }
}

/** Stops this device receiving the signed-in person's notifications (sign out, or turned off). */
export async function unregisterThisDevice(): Promise<void> {
  const token = readToken();
  if (!token) return;
  try {
    await supabase.rpc("unregister_push_token", { p_token: token });
  } catch (error) {
    console.error("Couldn't remove push token:", error);
  }
  writeToken(null);
}

/** On launch/sign-in: if they've turned push on, make sure this device's token is current. */
export async function syncPushRegistration(): Promise<void> {
  if (!pushAvailable()) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { data } = await supabase
    .from("user_settings")
    .select("push_enabled")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (data?.push_enabled) await enablePush();
}

/**
 * Mounted once inside the router: saves new device tokens, re-checks
 * registration after sign-in, and opens the right screen when a notification
 * is tapped.
 */
export function usePushRouting() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!pushAvailable()) return;

    let cancelled = false;
    const handles: { remove: () => Promise<void> }[] = [];

    (async () => {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      if (cancelled) return;

      handles.push(
        await PushNotifications.addListener("registration", (t) => { void saveToken(t.value); }),
        await PushNotifications.addListener("registrationError", (e) => console.error("Push registration error:", e)),
        await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
          const route = action.notification.data?.route;
          // Only ever open in-app screens.
          if (typeof route === "string" && /^\/[A-Za-z0-9/_-]*$/.test(route)) navigate(route);
        }),
      );

      void syncPushRegistration();
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void syncPushRegistration();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      handles.forEach((h) => void h.remove());
    };
  }, [navigate]);
}

type UpdateSettings = (patch: {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  notificationsDecidedAt?: string | null;
}) => Promise<boolean>;

/**
 * The one place "yes, notify me" is recorded. Saying yes opts in to email and
 * (in the app) asks iOS for push permission; both are stored with the moment
 * they answered.
 */
export async function acceptNotifications(update: UpdateSettings) {
  let pushOn = false;
  let denied = false;
  if (pushAvailable()) {
    const result = await enablePush();
    pushOn = result === "granted";
    denied = result === "denied";
  }
  const saved = await update({ pushEnabled: pushOn, emailEnabled: true, notificationsDecidedAt: new Date().toISOString() });
  return { pushOn, denied, saved };
}

export const declineNotifications = (update: UpdateSettings) =>
  update({ pushEnabled: false, emailEnabled: false, notificationsDecidedAt: new Date().toISOString() });
