import { supabase } from "@/integrations/supabase/client";

export type SafetyAnswer = "no" | "yes" | "declined" | "cleared";

export interface SafetyState {
  // false when the database couldn't answer — callers must not block people
  // on "unknown", only on a definite result.
  known: boolean;
  answer: SafetyAnswer | null;
}

export async function getSafetyState(userId: string): Promise<SafetyState> {
  try {
    const { data, error } = await supabase
      .from("user_safety")
      .select("answer")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return { known: false, answer: null };
    return { known: true, answer: (data?.answer as SafetyAnswer) ?? null };
  } catch {
    return { known: false, answer: null };
  }
}

export async function saveSafetyAnswer(userId: string, answer: SafetyAnswer): Promise<boolean> {
  const { error } = await supabase
    .from("user_safety")
    .upsert(
      { user_id: userId, answer, checked_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  return !error;
}

/** True only when we positively know they haven't been asked yet. */
export async function needsSafetyCheck(userId: string): Promise<boolean> {
  const state = await getSafetyState(userId);
  return state.known && state.answer === null;
}
