import { useState } from "react";

interface ThemeTag {
  id: string;
  label: string;
  confidence: number;
}

interface ExtractThemesResult {
  themes: string[];
  context: string;
  suggested_tags: ThemeTag[];
}

export function useExtractThemes() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractThemes = async (
    text: string,
    type: "struggles" | "strengths" | "goals" | "connection_intent"
  ): Promise<ExtractThemesResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-themes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, type }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to understand your response");
      }

      const data: ExtractThemesResult = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { extractThemes, isLoading, error };
}
