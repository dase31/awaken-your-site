import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MatchResult {
  match_user_id: string;
  display_name: string;
  shared_struggles: string[];
  shared_goals: string[];
  shared_intents: string[];
  score: number;
}

interface UseFindMatchReturn {
  match: MatchResult | null;
  isLoading: boolean;
  error: string | null;
  findMatch: (userId: string, excludeIds?: string[]) => Promise<MatchResult | null>;
  findAnotherMatch: () => Promise<MatchResult | null>;
}

export function useFindMatch(): UseFindMatchReturn {
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);

  const findMatch = useCallback(async (userId: string, excludeIds: string[] = []): Promise<MatchResult | null> => {
    setIsLoading(true);
    setError(null);
    setCurrentUserId(userId);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("find-match", {
        body: { user_id: userId, exclude_ids: excludeIds },
      });

      if (fnError) {
        throw fnError;
      }

      const result = data?.match || null;
      setMatch(result);
      
      if (result) {
        setExcludedIds((prev) => [...prev, result.match_user_id]);
      }

      return result;
    } catch (err: any) {
      console.error("Error finding match:", err);
      setError(err.message || "Failed to find match");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findAnotherMatch = useCallback(async (): Promise<MatchResult | null> => {
    if (!currentUserId) {
      setError("No user ID set");
      return null;
    }

    return findMatch(currentUserId, excludedIds);
  }, [currentUserId, excludedIds, findMatch]);

  return {
    match,
    isLoading,
    error,
    findMatch,
    findAnotherMatch,
  };
}
