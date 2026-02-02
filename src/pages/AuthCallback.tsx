import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingSubmit } from "@/hooks/useOnboardingSubmit";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { LoadingState } from "@/components/onboarding/LoadingState";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { saveOnboardingData } = useOnboardingSubmit();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          const user = session.user;
          const metadata = user.user_metadata;

          // Check if we have onboarding data to save
          if (metadata?.display_name) {
            await saveOnboardingData(user.id, {
              name: metadata.display_name || "",
              intentText: metadata.raw_intent_text || "",
              goalsText: metadata.raw_goals_text || "",
              connectionText: metadata.raw_connection_text || "",
              selectedStruggles: metadata.selected_struggles || [],
              selectedGoals: metadata.selected_goals || [],
              selectedIntents: metadata.selected_intents || [],
            });
          }

          setStatus("success");
          toast.success("Welcome! Your profile has been created.");
          
          // Redirect to home after a brief moment
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          // No session found, redirect to onboarding
          navigate("/onboarding");
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setStatus("error");
        toast.error("Something went wrong. Please try again.");
        
        setTimeout(() => {
          navigate("/onboarding");
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, saveOnboardingData]);

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
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
