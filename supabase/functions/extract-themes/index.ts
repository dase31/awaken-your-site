import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ThemeTag {
  id: string;
  label: string;
  confidence: number;
}

interface ExtractThemesResponse {
  themes: string[];
  context: string;
  suggested_tags: ThemeTag[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    if (type === "goals") {
      systemPrompt = `You are a compassionate listener helping understand someone's personal growth goals.
Extract themes from their words. Map to these goal categories when applicable:
- presence: Wanting to be more present/mindful
- anxiety_management: Learning to manage anxiety/stress
- connection: Building deeper connections with others
- self_worth: Working on self-esteem/confidence
- boundaries: Setting healthier boundaries
- healing: Processing past experiences/trauma
- purpose: Finding meaning/direction

Also capture any unique context about their goals that doesn't fit categories.
Return JSON with this exact structure:
{
  "themes": ["presence", "healing"], 
  "context": "Brief description of what they're working toward",
  "suggested_tags": [
    {"id": "presence", "label": "Being more present", "confidence": 0.95},
    {"id": "healing", "label": "Processing the past", "confidence": 0.85}
  ]
}
Only include tags with confidence > 0.6. Maximum 4 tags.`;
    } else if (type === "connection_intent") {
      systemPrompt = `You are a compassionate listener helping understand what kind of connection someone is seeking.
Extract themes from their words. Map to these connection categories when applicable:
- peer: Someone who's been through something similar
- listener: Someone who will just listen without judgment
- guide: Someone with wisdom/experience to share
- accountability: Someone to check in with regularly
- friend: Just someone to talk to casually

Also capture any unique context about what they're looking for.
Return JSON with this exact structure:
{
  "themes": ["peer", "listener"], 
  "context": "Brief description of the connection they seek",
  "suggested_tags": [
    {"id": "peer", "label": "Someone who understands", "confidence": 0.95},
    {"id": "listener", "label": "A listening ear", "confidence": 0.85}
  ]
}
Only include tags with confidence > 0.6. Maximum 4 tags.`;
    } else if (type === "strengths") {
      systemPrompt = `You are a compassionate listener helping understand what gifts and strengths someone brings to others.
Extract themes from their words. Map to these strength categories when applicable:
- listener: They listen deeply to others
- calm: They stay calm in difficult situations
- experienced: They've walked through darkness and have wisdom to share
- questions: They ask good, thoughtful questions
- space: They hold space for others without judgment
- share: They share openly from their own experience

Also capture any unique context about their gifts that doesn't fit categories.
Return JSON with this exact structure:
{
  "themes": ["listener", "calm"], 
  "context": "Brief description of their unique offering",
  "suggested_tags": [
    {"id": "listener", "label": "I listen deeply", "confidence": 0.95},
    {"id": "calm", "label": "I stay calm in storms", "confidence": 0.85}
  ]
}
Only include tags with confidence > 0.6. Maximum 4 tags.`;
    } else {
      // Default: struggles
      systemPrompt = `You are a compassionate listener helping understand what someone is experiencing or seeking.
Extract themes from their words. Map to these categories when applicable:
- anxiety: Worry, stress, overwhelm, nervousness
- loneliness: Feeling isolated, disconnected, alone
- grief: Loss, mourning, missing someone or something
- direction: Feeling lost, unsure of purpose, seeking meaning
- unheard: Feeling ignored, not understood, invisible
- doubt: Self-doubt, imposter feelings, lack of confidence

Also capture any unique context that doesn't fit categories.
Return JSON with this exact structure:
{
  "themes": ["loneliness", "direction"], 
  "context": "Brief description of their unique situation",
  "suggested_tags": [
    {"id": "loneliness", "label": "Loneliness", "confidence": 0.95},
    {"id": "direction", "label": "Finding direction", "confidence": 0.85}
  ]
}
Only include tags with confidence > 0.6. Maximum 4 tags.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to process your response");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    let parsedContent: ExtractThemesResponse;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to understand your response");
    }

    // Validate the response structure
    if (!parsedContent.themes || !Array.isArray(parsedContent.themes)) {
      parsedContent.themes = [];
    }
    if (!parsedContent.context || typeof parsedContent.context !== "string") {
      parsedContent.context = "";
    }
    if (!parsedContent.suggested_tags || !Array.isArray(parsedContent.suggested_tags)) {
      parsedContent.suggested_tags = [];
    }

    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("extract-themes error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Something went wrong" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
