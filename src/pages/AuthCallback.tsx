import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingSubmit } from "@/hooks/useOnboardingSubmit";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { LoadingState } from "@/components/onboarding/LoadingState";
import ThymosLogo from "@/components/ThymosLogo";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

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
          setStatus("success");
          toast.success("Welcome back.");
          setTimeout(() => navigate("/home"), 1000);
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
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
      <ThymosLogo />
      <OnboardingBackground />

      <div className="relative z-10 text-center px-6 max-w-md w-full fade-in-up">
        {status === "loading" && (
          <LoadingState message="Setting up your space..." />
        )}

        {status === "success" && (
          <>
            <h1 className="font-serif text-foreground text-3xl md:text-4xl leading-relaxed mb-4">
              Welcome aboard
            </h1>
            <p className="text-foreground/60 text-lg font-serif">
              Redirecting you now...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="font-serif text-foreground text-3xl md:text-4xl leading-relaxed mb-4">
              Something went wrong
            </h1>
            <p className="text-foreground/60 text-lg font-serif">
              Redirecting to start over...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
