import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingSubmit } from "@/hooks/useOnboardingSubmit";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { LoadingState } from "@/components/onboarding/LoadingState";
import ThymosLogo from "@/components/ThymosLogo";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { saveOnboardingData } = useOnboardingSubmit();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const hasSaved = useRef(false);

  useEffect(() => {
    // Set up auth state listener FIRST - this handles the token exchange from URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.id);

        if (event === "SIGNED_IN" && session?.user) {
          // Guard against double-fire (onAuthStateChange + checkExistingSession race)
          if (hasSaved.current) return;
          hasSaved.current = true;

          const user = session.user;
          const metadata = user.user_metadata;
          const isNewUser = !!metadata?.display_name;

          try {
            if (isNewUser) {
              // New user coming through onboarding — save their data
              await saveOnboardingData(user.id, {
                name: metadata.display_name || "",
                intentText: metadata.raw_intent_text || "",
                goalsText: metadata.raw_goals_text || "",
                connectionText: metadata.raw_connection_text || "",
                selectedStruggles: metadata.selected_struggles || [],
                selectedGoals: metadata.selected_goals || [],
                selectedIntents: metadata.selected_intents || [],
              });
              setStatus("success");
              toast.success("Welcome! Your profile has been created.");
              setTimeout(() => navigate("/username-setup"), 1200);
            } else {
              // Returning user — go straight home
              setStatus("success");
              toast.success("Welcome back.");
              setTimeout(() => navigate("/home"), 1000);
            }
          } catch (error: any) {
            console.error("Error saving onboarding data:", error);
            setStatus("error");
            toast.error("Something went wrong. Please try again.");
            
            setTimeout(() => {
              navigate("/onboarding");
            }, 2000);
          }
        }
      }
    );

    // Check if there's already a session (user might have refreshed)
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setStatus("success");
        // If they have display_name metadata they came from onboarding; otherwise returning login
        if (metadata?.display_name) {
          setTimeout(() => {
            navigate("/match", {
              state: { userId: session.user.id, userName: metadata.display_name || "Friend" },
            });
          }, 1000);
        } else {
          setTimeout(() => navigate("/home"), 800);
        }
      } else if (!window.location.hash && !window.location.search) {
        // No session and no auth tokens in URL - redirect to onboarding
        navigate("/onboarding");
      }
      // If there are tokens in URL, wait for onAuthStateChange to handle them
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
