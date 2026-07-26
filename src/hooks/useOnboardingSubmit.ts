import { supabase } from "@/integrations/supabase/client";

interface OnboardingData {
  name: string;
  intentText: string;
  goalsText: string;
  connectionText: string;
  selectedStruggles: string[];
  selectedGoals: string[];
  selectedIntents: string[];
  offerTags: string[];
  capacityLevel: string;
  quoteText: string;
}

export const useOnboardingSubmit = () => {
  const saveOnboardingData = async (userId: string, data: OnboardingData) => {
    // 1. Create/update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        display_name: data.name,
        raw_intent_text: data.intentText,
        raw_goals_text: data.goalsText,
        raw_connection_text: data.connectionText,
        capacity_level: data.capacityLevel || null,
        quote_text: data.quoteText || null,
      });

    if (profileError) {
      console.error("Error saving profile:", profileError);
      throw new Error("Failed to save profile");
    }

    // 2. Clear existing tags first to prevent duplicates if auth callback fires twice
    await Promise.all([
      supabase.from("user_struggles").delete().eq("user_id", userId),
      supabase.from("user_goals").delete().eq("user_id", userId),
      supabase.from("user_connection_intents").delete().eq("user_id", userId),
      supabase.from("user_offers").delete().eq("user_id", userId),
    ]);

    // 3. Insert struggles
    if (data.selectedStruggles.length > 0) {
      const struggles = data.selectedStruggles.map((struggle) => ({
        user_id: userId,
        struggle_type: struggle,
      }));

      const { error: strugglesError } = await supabase
        .from("user_struggles")
        .insert(struggles);

      if (strugglesError) {
        console.error("Error saving struggles:", strugglesError);
        throw new Error("Failed to save struggles");
      }
    }

    // 4. Insert goals
    if (data.selectedGoals.length > 0) {
      const goals = data.selectedGoals.map((goal) => ({
        user_id: userId,
        goal_type: goal,
      }));

      const { error: goalsError } = await supabase
        .from("user_goals")
        .insert(goals);

      if (goalsError) {
        console.error("Error saving goals:", goalsError);
        throw new Error("Failed to save goals");
      }
    }

    // 5. Insert connection intents
    if (data.selectedIntents.length > 0) {
      const intents = data.selectedIntents.map((intent) => ({
        user_id: userId,
        intent_type: intent,
      }));

      const { error: intentsError } = await supabase
        .from("user_connection_intents")
        .insert(intents);

      if (intentsError) {
        console.error("Error saving intents:", intentsError);
        throw new Error("Failed to save connection intents");
      }
    }

    // 6. Insert offers
    if (data.offerTags.length > 0) {
      const offers = data.offerTags.map((offer) => ({
        user_id: userId,
        offer_type: offer,
      }));

      const { error: offersError } = await supabase
        .from("user_offers")
        .insert(offers);

      if (offersError) {
        console.error("Error saving offers:", offersError);
        throw new Error("Failed to save offers");
      }
    }

    return true;
  };

  return { saveOnboardingData };
};
