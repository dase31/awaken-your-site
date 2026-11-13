import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFindMatch, MatchResult } from "@/hooks/useFindMatch";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { LoadingState } from "@/components/onboarding/LoadingState";
import { MatchIntro } from "@/components/matches/MatchIntro";
import { getSafetyState, saveSafetyAnswer } from "@/lib/safety";
import { EmptyMatchState } from "@/components/matches/EmptyMatchState";
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

  const { findMatch, findAnotherMatch, reason, isLoading: isLoadingAnother } = useFindMatch();
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
    <OnboardingFrame hideChrome>
      {safetyHold && (
        <div className="th-card-lg fade-in-up">
          <h1 className="th-h1 text-[1.7rem]">Take care of you first</h1>
          <p className="th-sub mb-6 mt-3">
            You told us things are heavy right now. Talking to someone who's trained to help
            can make a real difference, and it's free.
          </p>
          <div className="flex flex-col items-center gap-3">
            <button type="button" onClick={() => navigate("/crisis")} className="th-btn">
              See support options
            </button>
            <button type="button" onClick={resumeMatching} className="th-text-link">
              I'm okay — find me someone
            </button>
            <button type="button" onClick={() => navigate("/home")} className="th-text-link">
              Back home
            </button>
          </div>
        </div>
      )}

      {showLoading && <LoadingState message="Finding someone who gets it..." />}

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
        <EmptyMatchState
          reason={reason}
          onResume={() => {
            setInitialLoading(true);
          }}
        />
      )}
    </OnboardingFrame>
  );
};

export default Match;
