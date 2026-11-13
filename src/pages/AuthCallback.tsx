import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingSubmit } from "@/hooks/useOnboardingSubmit";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { LoadingState } from "@/components/onboarding/LoadingState";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { needsSafetyCheck } from "@/lib/safety";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { saveOnboardingData } = useOnboardingSubmit();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const hasResolved = useRef(false);

  useEffect(() => {
    // Single source of truth for "where should this signed-in user land."
    // Always checks the real profiles table — never trusts metadata alone,
    // since display_name stays on the user forever after their first signup.
    const resolveDestination = async (user: User) => {
      if (hasResolved.current) return;
      hasResolved.current = true;

      const metadata = user.user_metadata;

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, username")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          // Anyone who hasn't answered the private safety question yet is
          // asked once, then lands home.
          const ask = await needsSafetyCheck(user.id);
          setStatus("success");
          toast.success("Welcome back.");
          setTimeout(() => navigate(ask ? "/safety-check?next=/home" : "/home"), 1000);
        } else if (metadata?.display_name) {
          await saveOnboardingData(user.id, {
            name: metadata.display_name || "",
            intentText: metadata.raw_intent_text || "",
            goalsText: metadata.raw_goals_text || "",
            connectionText: metadata.raw_connection_text || "",
            selectedStruggles: metadata.selected_struggles || [],
            selectedGoals: metadata.selected_goals || [],
            selectedIntents: metadata.selected_intents || [],
            offerTags: metadata.offer_tags || [],
            capacityLevel: metadata.capacity_level || "",
            quoteText: metadata.quote_text || "",
          });
          setStatus("success");
          toast.success("Welcome! Your profile has been created.");
          setTimeout(() => navigate("/username-setup"), 1200);
        } else {
          setStatus("success");
          setTimeout(() => navigate("/onboarding"), 1000);
        }
      } catch (error: any) {
        console.error("Error saving onboarding data:", error);
        setStatus("error");
        toast.error("Something went wrong. Please try again.");
        setTimeout(() => navigate("/onboarding"), 2000);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          resolveDestination(session.user);
        }
      }
    );

    // Covers the page-refresh case: a session already exists before this
    // component's listener attaches, so SIGNED_IN never fires again.
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        resolveDestination(session.user);
      } else if (!window.location.hash && !window.location.search) {
        // No session and no auth tokens in the URL — nothing to resolve.
        navigate("/onboarding");
      }
      // If tokens ARE in the URL, wait for onAuthStateChange to fire.
    };

    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, saveOnboardingData]);

  return (
    <OnboardingFrame hideChrome>
      {status === "loading" && <LoadingState message="Setting up your space..." />}

      {status === "success" && (
        <div className="th-card-lg fade-in-up">
          <h1 className="th-h1 text-[1.7rem]">Welcome aboard</h1>
          <p className="th-sub mt-2">Redirecting you now...</p>
        </div>
      )}

      {status === "error" && (
        <div className="th-card-lg fade-in-up">
          <h1 className="th-h1 text-[1.7rem]">Something went wrong</h1>
          <p className="th-sub mt-2">Redirecting to start over...</p>
        </div>
      )}
    </OnboardingFrame>
  );
};

export default AuthCallback;
