import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyBlockedIds } from "@/lib/blocks";

export interface ConversationWithDetails {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string | null;
  lastMessageAt: string;
  updatedAt: string;
  conversationType: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: convos, error } = await supabase
      .from("conversations")
      .select("id, user_one, user_two, updated_at, conversation_type")
      .or(`user_one.eq.${user.id},user_two.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (error || !convos) { setLoading(false); return; }

    const blocked = new Set(await fetchMyBlockedIds());
    const visible = convos.filter(
      c => !blocked.has(c.user_one === user.id ? c.user_two : c.user_one)
    );

    const otherUserIds = visible.map(c => c.user_one === user.id ? c.user_two : c.user_one);
    
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", otherUserIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) ?? []);

    // Fetch all messages for these conversations at once, newest first, then
    // keep the first (latest) seen per conversation.
    const { data: messages } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", visible.map(c => c.id))
      .order("created_at", { ascending: false });

    const lastMessageMap = new Map<string, { content: string; created_at: string }>();
    for (const msg of messages ?? []) {
      if (!lastMessageMap.has(msg.conversation_id)) {
        lastMessageMap.set(msg.conversation_id, { content: msg.content, created_at: msg.created_at });
      }
    }

    const results: ConversationWithDetails[] = visible.map(convo => {
      const otherId = convo.user_one === user.id ? convo.user_two : convo.user_one;
      const lastMsg = lastMessageMap.get(convo.id);

      return {
        id: convo.id,
        otherUserId: otherId,
        otherUserName: profileMap.get(otherId) ?? "Unknown",
        lastMessage: lastMsg?.content ?? null,
        lastMessageAt: lastMsg?.created_at ?? convo.updated_at,
        updatedAt: convo.updated_at,
        conversationType: (convo as any).conversation_type ?? "connection",
      };
    });

    setConversations(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return { conversations, loading, refetch: fetchConversations };
}
