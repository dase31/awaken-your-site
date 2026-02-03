import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MatchResult {
  match_user_id: string;
  display_name: string;
  shared_struggles: string[];
  shared_goals: string[];
  shared_intents: string[];
  score: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, exclude_ids = [] } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current user's tags
    const [userStruggles, userGoals, userIntents] = await Promise.all([
      supabase
        .from("user_struggles")
        .select("struggle_type")
        .eq("user_id", user_id),
      supabase
        .from("user_goals")
        .select("goal_type")
        .eq("user_id", user_id),
      supabase
        .from("user_connection_intents")
        .select("intent_type")
        .eq("user_id", user_id),
    ]);

    const myStruggles = (userStruggles.data || []).map((s) => s.struggle_type);
    const myGoals = (userGoals.data || []).map((g) => g.goal_type);
    const myIntents = (userIntents.data || []).map((i) => i.intent_type);

    // If user has no tags, return null
    if (myStruggles.length === 0 && myGoals.length === 0 && myIntents.length === 0) {
      return new Response(
        JSON.stringify({ match: null, reason: "no_tags" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all other users (excluding current user and excluded ids)
    const excludeList = [user_id, ...exclude_ids];
    const { data: otherProfiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .not("id", "in", `(${excludeList.join(",")})`);

    if (!otherProfiles || otherProfiles.length === 0) {
      return new Response(
        JSON.stringify({ match: null, reason: "no_other_users" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all tags for potential matches
    const otherUserIds = otherProfiles.map((p) => p.id);
    
    const [allStruggles, allGoals, allIntents] = await Promise.all([
      supabase
        .from("user_struggles")
        .select("user_id, struggle_type")
        .in("user_id", otherUserIds),
      supabase
        .from("user_goals")
        .select("user_id, goal_type")
        .in("user_id", otherUserIds),
      supabase
        .from("user_connection_intents")
        .select("user_id, intent_type")
        .in("user_id", otherUserIds),
    ]);

    // Build a map of user tags
    const userTagsMap: Record<string, {
      struggles: string[];
      goals: string[];
      intents: string[];
    }> = {};

    otherUserIds.forEach((uid) => {
      userTagsMap[uid] = { struggles: [], goals: [], intents: [] };
    });

    (allStruggles.data || []).forEach((s) => {
      if (userTagsMap[s.user_id]) {
        userTagsMap[s.user_id].struggles.push(s.struggle_type);
      }
    });

    (allGoals.data || []).forEach((g) => {
      if (userTagsMap[g.user_id]) {
        userTagsMap[g.user_id].goals.push(g.goal_type);
      }
    });

    (allIntents.data || []).forEach((i) => {
      if (userTagsMap[i.user_id]) {
        userTagsMap[i.user_id].intents.push(i.intent_type);
      }
    });

    // Intent complementarity map
    const intentComplements: Record<string, string[]> = {
      listener: ["need_to_be_heard", "vent", "seeking_guidance"],
      need_to_be_heard: ["listener", "peer_support"],
      vent: ["listener"],
      peer_support: ["peer_support", "mutual_growth"],
      mutual_growth: ["peer_support", "mutual_growth"],
      guide: ["seeking_guidance"],
      seeking_guidance: ["guide", "listener"],
      accountability: ["accountability"],
      just_connect: ["just_connect", "peer_support", "listener", "mutual_growth"],
    };

    // Calculate scores for each potential match
    const matches: MatchResult[] = [];

    for (const profile of otherProfiles) {
      const tags = userTagsMap[profile.id];
      if (!tags) continue;

      // Calculate shared items
      const sharedStruggles = myStruggles.filter((s) => tags.struggles.includes(s));
      const sharedGoals = myGoals.filter((g) => tags.goals.includes(g));
      
      // Calculate complementary intents
      const sharedIntents: string[] = [];
      for (const myIntent of myIntents) {
        const complements = intentComplements[myIntent] || [];
        for (const theirIntent of tags.intents) {
          if (myIntent === theirIntent || complements.includes(theirIntent)) {
            if (!sharedIntents.includes(theirIntent)) {
              sharedIntents.push(theirIntent);
            }
          }
        }
      }

      // Score calculation: struggles x3, goals x2, intents x2
      const score =
        sharedStruggles.length * 3 +
        sharedGoals.length * 2 +
        sharedIntents.length * 2;

      // Only include if there's some connection
      if (score > 0) {
        matches.push({
          match_user_id: profile.id,
          display_name: profile.display_name,
          shared_struggles: sharedStruggles,
          shared_goals: sharedGoals,
          shared_intents: sharedIntents,
          score,
        });
      }
    }

    // Sort by score descending and return top match
    matches.sort((a, b) => b.score - a.score);
    const topMatch = matches[0] || null;

    return new Response(
      JSON.stringify({ match: topMatch }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in find-match:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
