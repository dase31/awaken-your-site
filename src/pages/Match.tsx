import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFindMatch, MatchResult } from "@/hooks/useFindMatch";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { LoadingState } from "@/components/onboarding/LoadingState";
import { MatchIntro } from "@/components/matches/MatchIntro";
import { EmptyMatchState } from "@/components/matches/EmptyMatchState";
import ThymosLogo from "@/components/ThymosLogo";
import { toast } from "sonner";

interface LocationState {
  userId?: string;
  userName?: string;
  initialMatch?: MatchResult;
}

const Match = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [userId, setUserId] = useState<string | null>(state?.userId || null);
  const [userName, setUserName] = useState<string>(state?.userName || "");
  const [currentMatch, setCurrentMatch] = useState<MatchResult | null>(
    state?.initialMatch || null
  );
  const [initialLoading, setInitialLoading] = useState(!state?.initialMatch);

  const { findMatch, findAnotherMatch, isLoading: isLoadingAnother } = useFindMatch();

  // Load user session if not passed via state
  useEffect(() => {
    const loadUser = async () => {
      if (userId && userName) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/onboarding");
        return;
      }

      setUserId(session.user.id);

      // Get user's display name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", session.user.id)
        .maybeSingle();

      setUserName(profile?.display_name || "Friend");
    };

    loadUser();
  }, [userId, userName, navigate]);

  // Find initial match if not provided
  useEffect(() => {
    const loadInitialMatch = async () => {
      if (!userId || currentMatch || !initialLoading) return;

      const match = await findMatch(userId);
      setCurrentMatch(match);
      setInitialLoading(false);
    };

    loadInitialMatch();
  }, [userId, currentMatch, initialLoading, findMatch]);

  const handleConnect = () => {
    if (currentMatch) {
      toast.success(`We'll let ${currentMatch.display_name} know you're interested!`);
      // Future: Store connection request in database
    }
  };

  const handleFindAnother = async () => {
    const newMatch = await findAnotherMatch();
    setCurrentMatch(newMatch);
    
    if (!newMatch) {
      toast.info("No more matches available right now");
    }
  };

  const showLoading = initialLoading || (!currentMatch && !userId);

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
      <ThymosLogo />
      <OnboardingBackground />

      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {showLoading && (
          <LoadingState message="Finding someone who gets it..." />
        )}

        {!showLoading && currentMatch && (
          <MatchIntro
            userName={userName}
            matchName={currentMatch.display_name}
            sharedStruggles={currentMatch.shared_struggles}
            sharedGoals={currentMatch.shared_goals}
            sharedIntents={currentMatch.shared_intents}
            onConnect={handleConnect}
            onFindAnother={handleFindAnother}
            isLoadingAnother={isLoadingAnother}
          />
        )}

        {!showLoading && !currentMatch && (
          <EmptyMatchState />
        )}
      </div>
    </div>
  );
};

export default Match;
