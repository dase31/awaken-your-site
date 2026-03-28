import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TelosPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  post_type: string;
  category: string;
  status: string;
  created_at: string;
  author_name?: string;
  author_specialties?: string[];
}

export function useTelosPosts() {
  const [posts, setPosts] = useState<TelosPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) setUserId(session.user.id);

    const { data: postsData } = await supabase
      .from("telos_posts")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (!postsData) { setLoading(false); return; }

    // Fetch author names and specialties
    const userIds = [...new Set(postsData.map(p => p.user_id))];
    const [{ data: profiles }, { data: specs }] = await Promise.all([
      supabase.from("profiles").select("id, display_name").in("id", userIds),
      supabase.from("telos_specialties").select("user_id, specialty").in("user_id", userIds),
    ]);

    const nameMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.display_name]));
    const specMap: Record<string, string[]> = {};
    (specs ?? []).forEach((s: any) => {
      if (!specMap[s.user_id]) specMap[s.user_id] = [];
      specMap[s.user_id].push(s.specialty);
    });

    setPosts(postsData.map(p => ({
      ...p,
      author_name: nameMap[p.user_id] || "Someone",
      author_specialties: specMap[p.user_id] || [],
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const createPost = async (title: string, description: string, postType: string, category: string) => {
    if (!userId) return;
    await supabase.from("telos_posts").insert({
      user_id: userId,
      title,
      description,
      post_type: postType,
      category,
    });
    fetchPosts();
  };

  const startTelosChat = async (postAuthorId: string): Promise<string | null> => {
    if (!userId || userId === postAuthorId) return null;

    // Check if telos conversation already exists between these two
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("conversation_type", "telos")
      .or(`and(user_one.eq.${userId},user_two.eq.${postAuthorId}),and(user_one.eq.${postAuthorId},user_two.eq.${userId})`);

    if (existing && existing.length > 0) return existing[0].id;

    // Create new telos conversation
    const { data: newConvo } = await supabase
      .from("conversations")
      .insert({ user_one: userId, user_two: postAuthorId, conversation_type: "telos" })
      .select("id")
      .single();

    return newConvo?.id ?? null;
  };

  return { posts, loading, userId, createPost, startTelosChat, refetch: fetchPosts };
}
