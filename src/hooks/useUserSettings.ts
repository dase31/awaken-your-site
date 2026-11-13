import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserSettings {
  matchingPaused: boolean;
  // null means no limit.
  maxActiveConnections: number | null;
  pushEnabled: boolean;
  emailEnabled: boolean;
  // null means they haven't been asked about notifications yet.
  notificationsDecidedAt: string | null;
}

const DEFAULTS: UserSettings = {
  matchingPaused: false,
  maxActiveConnections: null,
  pushEnabled: false,
  emailEnabled: false,
  notificationsDecidedAt: null,
};

const toRow = (patch: Partial<UserSettings>) => ({
  ...(patch.matchingPaused !== undefined && { matching_paused: patch.matchingPaused }),
  ...(patch.maxActiveConnections !== undefined && { max_active_connections: patch.maxActiveConnections }),
  ...(patch.pushEnabled !== undefined && { push_enabled: patch.pushEnabled }),
  ...(patch.emailEnabled !== undefined && { email_enabled: patch.emailEnabled }),
  ...(patch.notificationsDecidedAt !== undefined && { notifications_decided_at: patch.notificationsDecidedAt }),
});

// The signed-in person's own settings. A missing row just means defaults.
export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    const { data } = await supabase
      .from("user_settings")
      .select("matching_paused, max_active_connections, push_enabled, email_enabled, notifications_decided_at")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (data) {
      setSettings({
        matchingPaused: data.matching_paused ?? false,
        maxActiveConnections: data.max_active_connections ?? null,
        pushEnabled: data.push_enabled ?? false,
        emailEnabled: data.email_enabled ?? false,
        notificationsDecidedAt: data.notifications_decided_at ?? null,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Optimistic: the screen updates at once and rolls back if the save fails.
  const update = useCallback(async (patch: Partial<UserSettings>): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    let previous: UserSettings = DEFAULTS;
    setSettings((s) => { previous = s; return { ...s, ...patch }; });

    const { error } = await supabase
      .from("user_settings")
      .upsert({ user_id: session.user.id, ...toRow(patch), updated_at: new Date().toISOString() });

    if (error) {
      console.error("Error saving settings:", error);
      setSettings(previous);
      return false;
    }
    return true;
  }, []);

  return { settings, loading, update, reload: load };
}
