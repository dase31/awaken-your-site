import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFindMatch, MatchResult } from "@/hooks/useFindMatch";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { LoadingState } from "@/components/onboarding/LoadingState";
import { MatchIntro } from "@/components/matches/MatchIntro";
import { getSafetyState, saveSafetyAnswer } from "@/lib/safety";
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
  // Matching waits until we know where they stand on the private safety
  // question. "Unknown" (lookup failed) never blocks anyone.
  const [safetyChecked, setSafetyChecked] = useState(false);
  const [safetyHold, setSafetyHold] = useState(false);

  const { findMatch, findAnotherMatch, isLoading: isLoadingAnother } = useFindMatch();
  const { sendRequest } = useConnectionRequests();

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

  useEffect(() => {
    if (!userId) return;
    const check = async () => {
      const safety = await getSafetyState(userId);
      if (safety.known && safety.answer === null) {
        navigate("/safety-check?next=/match", { replace: true });
        return;
      }
      if (safety.known && safety.answer === "yes") setSafetyHold(true);
      setSafetyChecked(true);
    };
    check();
  }, [userId, navigate]);

  // Find initial match if not provided
  useEffect(() => {
    const loadInitialMatch = async () => {
      if (!userId || currentMatch || !initialLoading || !safetyChecked || safetyHold) return;

      const match = await findMatch(userId);
      setCurrentMatch(match);
      setInitialLoading(false);
    };

    loadInitialMatch();
  }, [userId, currentMatch, initialLoading, findMatch, safetyChecked, safetyHold]);

  const handleConnect = async () => {
    if (!currentMatch) return;
    const success = await sendRequest(currentMatch.match_user_id);
    if (success) {
      navigate("/connect");
    }
  };

  const handleFindAnother = async () => {
    const newMatch = await findAnotherMatch();
    setCurrentMatch(newMatch);
    
    if (!newMatch) {
      toast.info("No more matches available right now");
    }
  };

  const handleConnectLater = () => {
    navigate("/home");
  };

  const showLoading = !safetyHold && (initialLoading || (!currentMatch && !userId));

  const resumeMatching = async () => {
    if (userId) await saveSafetyAnswer(userId, "cleared");
    setSafetyHold(false);
  };

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
      <ThymosLogo />
      <OnboardingBackground />

      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {safetyHold && (
          <div className="fade-in-up text-center px-6 max-w-md w-full">
            <h1
              className="font-serif text-white text-3xl mb-4"
              style={{ textShadow: "0 2px 16px rgba(0,60,120,0.2)" }}
            >
              Take care of you first
            </h1>
            <p className="text-white/70 text-base leading-relaxed mb-8">
              You told us things are heavy right now. Talking to someone who's trained to help
              can make a real difference, and it's free.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/crisis")}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/40 text-white text-base py-3.5 rounded-full hover:bg-white/30 active:scale-[0.98] transition-all"
              >
                See support options
              </button>
              <button
                onClick={resumeMatching}
                className="w-full text-white/60 text-sm py-3 hover:text-white transition-colors"
              >
                I'm okay — find me someone
              </button>
              <button
                onClick={() => navigate("/home")}
                className="w-full text-white/40 text-xs py-2 hover:text-white/70 transition-colors"
              >
                Back home
              </button>
            </div>
          </div>
        )}

        {showLoading && (
          <LoadingState message="Finding someone who gets it..." />
        )}

        {!showLoading && !safetyHold && currentMatch && (
          <MatchIntro
            userName={userName}
            matchName={currentMatch.display_name}
            sharedStruggles={currentMatch.shared_struggles}
            sharedGoals={currentMatch.shared_goals}
            sharedIntents={currentMatch.shared_intents}
            matchQuote={currentMatch.quote_text}
            onConnect={handleConnect}
            onFindAnother={handleFindAnother}
            onConnectLater={handleConnectLater}
            isLoadingAnother={isLoadingAnother}
          />
        )}

        {!showLoading && !safetyHold && !currentMatch && (
          <EmptyMatchState />
        )}
      </div>
    </div>
  );
};

export default Match;
