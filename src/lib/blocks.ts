import { supabase } from "@/integrations/supabase/client";

// Every call here degrades to "nobody is blocked" if the database can't
// answer — blocking must never be able to take chat or matching down.

/** People the signed-in user has blocked. */
export async function fetchMyBlockedIds(): Promise<string[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];
    const { data, error } = await supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", session.user.id);
    if (error || !data) return [];
    return data.map((r) => r.blocked_id);
  } catch {
    return [];
  }
}

/**
 * Everyone to hide from matching and Telos: people the user blocked AND
 * people who blocked them, so neither side can find the other.
 */
export async function fetchBlockExclusions(): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc("my_block_exclusions");
    if (error || !data) return [];
    return data as string[];
  } catch {
    return [];
  }
}

export async function blockUser(otherId: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { error } = await supabase
    .from("user_blocks")
    .insert({ blocker_id: session.user.id, blocked_id: otherId });
  // 23505 = already blocked, which is the outcome they wanted anyway.
  return !error || error.code === "23505";
}

export async function unblockUser(otherId: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", session.user.id)
    .eq("blocked_id", otherId);
  return !error;
}

export type ReportReason =
  | "harassment" | "self_harm" | "hate" | "spam" | "inappropriate" | "other";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate", label: "Hate or discrimination" },
  { value: "inappropriate", label: "Sexual or inappropriate content" },
  { value: "self_harm", label: "Talking about hurting themselves" },
  { value: "spam", label: "Spam or selling something" },
  { value: "other", label: "Something else" },
];

export interface ReportInput {
  reportedUserId: string;
  reportedName: string;
  reason: ReportReason;
  details?: string;
  conversationId?: string;
  telosPostId?: string;
  // A snapshot of what was said, so the report still makes sense if the
  // content or the account is later deleted.
  context?: string;
}

export async function fileReport(input: ReportInput): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { error } = await supabase.from("reports").insert({
    reporter_id: session.user.id,
    reported_user_id: input.reportedUserId,
    reported_name: input.reportedName,
    reason: input.reason,
    details: input.details?.trim().slice(0, 1000) || null,
    conversation_id: input.conversationId ?? null,
    telos_post_id: input.telosPostId ?? null,
    context: input.context?.slice(0, 4000) || null,
  });
  return !error;
}
