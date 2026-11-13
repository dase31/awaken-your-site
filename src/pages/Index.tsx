import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";

const Index = () => {
  const navigate = useNavigate();

  // Safety net for auth links that land here instead of /auth/callback.
  // Supabase falls back to the Site URL (this page) when a requested
  // emailRedirectTo isn't in its allowlist, which would otherwise strand a
  // freshly signed-in user on the landing page. Hand off to /auth/callback,
  // which resolves where they actually belong.
  useEffect(() => {
    let cancelled = false;

    const handoff = () => {
      if (!cancelled) navigate("/auth/callback", { replace: true });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handoff();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) handoff();
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <OnboardingFrame photo hideChrome>
      <div className="th-on-sky text-center">
        <h1 className="th-h1 fade-in-up mx-auto max-w-[20rem] text-[clamp(2.1rem,9vw,3rem)]">
          It's time to actually re-connect.
        </h1>
        <div className="fade-in-up mt-10 flex flex-col items-center gap-4" style={{ animationDelay: "0.4s" }}>
          <button
            type="button"
            onClick={() => navigate("/onboarding")}
            className="inline-flex items-center justify-center rounded-full bg-white px-[30px] py-[13px] text-[0.92rem] font-medium text-[color:var(--th-ink)] shadow-[0_10px_30px_-12px_rgba(10,20,35,0.45)] transition-transform active:scale-[0.98]"
            style={{ textShadow: "none" }}
          >
            Begin
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[0.85rem] opacity-90 transition-opacity hover:opacity-100"
          >
            Sign in with your email
          </button>
        </div>
      </div>
    </OnboardingFrame>
  );
};

export default Index;
