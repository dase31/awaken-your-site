import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ConversationWithDetails {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string | null;
  lastMessageAt: string;
  updatedAt: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: convos, error } = await supabase
      .from("conversations")
      .select("id, user_one, user_two, updated_at")
      .or(`user_one.eq.${user.id},user_two.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (error || !convos) { setLoading(false); return; }

    const otherUserIds = convos.map(c => c.user_one === user.id ? c.user_two : c.user_one);
    
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", otherUserIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) ?? []);

    // Get last message for each conversation
    const results: ConversationWithDetails[] = [];
    for (const convo of convos) {
      const otherId = convo.user_one === user.id ? convo.user_two : convo.user_one;
      
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", convo.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      results.push({
        id: convo.id,
        otherUserId: otherId,
        otherUserName: profileMap.get(otherId) ?? "Unknown",
        lastMessage: lastMsg?.content ?? null,
        lastMessageAt: lastMsg?.created_at ?? convo.updated_at,
        updatedAt: convo.updated_at,
      });
    }

    setConversations(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return { conversations, loading, refetch: fetchConversations };
}
