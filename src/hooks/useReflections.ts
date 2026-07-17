import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Reflection {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
}

const LOCAL_KEY = "thymos_reflections";

function loadLocal(): Reflection[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveLocal(reflections: Reflection[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(reflections));
}

export function useReflections() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReflections = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // No auth — use localStorage
      setReflections(loadLocal());
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("reflections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reflections:", error);
      setLoading(false);
      return;
    }

    setReflections(
      (data ?? []).map(r => ({
        id: r.id,
        prompt: r.prompt,
        response: r.response,
        createdAt: r.created_at,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReflections();
  }, [fetchReflections]);

  const saveReflection = useCallback(async (prompt: string, response: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // No auth — persist to localStorage
      const existing = loadLocal();
      const newReflection: Reflection = {
        id: crypto.randomUUID(),
        prompt,
        response,
        createdAt: new Date().toISOString(),
      };
      const updated = [newReflection, ...existing];
      saveLocal(updated);
      setReflections(updated);
      toast.success("Reflection saved");
      return true;
    }

    const { error } = await supabase
      .from("reflections")
      .insert({ user_id: user.id, prompt, response });

    if (error) {
      console.error("Error saving reflection:", error);
      toast.error("Failed to save reflection");
      return false;
    }

    toast.success("Reflection saved");
    await fetchReflections();
    return true;
  }, [fetchReflections]);

  return { reflections, loading, saveReflection, refetch: fetchReflections };
}
