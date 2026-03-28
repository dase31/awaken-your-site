import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TelosProfile {
  description: string | null;
  specialties: string[];
}

export function useTelosProfile() {
  const [profile, setProfile] = useState<TelosProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }
      setUserId(session.user.id);

      const [{ data: tp }, { data: specs }] = await Promise.all([
        supabase.from("telos_profiles").select("description").eq("user_id", session.user.id).maybeSingle(),
        supabase.from("telos_specialties").select("specialty").eq("user_id", session.user.id),
      ]);

      if (tp) {
        setProfile({
          description: tp.description,
          specialties: (specs ?? []).map((s: any) => s.specialty),
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const saveProfile = async (description: string, specialties: string[]) => {
    if (!userId) return;

    // Upsert telos profile
    const { error: profileError } = await supabase
      .from("telos_profiles")
      .upsert({ user_id: userId, description, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    if (profileError) throw profileError;

    // Replace specialties
    await supabase.from("telos_specialties").delete().eq("user_id", userId);
    if (specialties.length > 0) {
      const rows = specialties.map(s => ({ user_id: userId, specialty: s }));
      await supabase.from("telos_specialties").insert(rows);
    }

    setProfile({ description, specialties });
  };

  return { profile, loading, saveProfile, userId };
}
