import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import ThymosLogo from "@/components/ThymosLogo";
import { CrisisResources } from "@/components/safety/CrisisResources";
import { getSafetyState, saveSafetyAnswer, type SafetyAnswer } from "@/lib/safety";

// Only ever send people to a known in-app destination.
const ALLOWED_NEXT = new Set(["/home", "/match", "/telos"]);
const safeNext = (value: string | null) => (value && ALLOWED_NEXT.has(value) ? value : "/home");

type View = "loading" | "ask" | "support";

// One private question, asked once. The answer is stored where only the
// person themselves can read it and is never used for matching.
const SafetyCheck = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [view, setView] = useState<View>("loading");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/", { replace: true }); return; }
      setUserId(session.user.id);

      const state = await getSafetyState(session.user.id);
      if (!state.known) { navigate(next, { replace: true }); return; } // never trap someone on a lookup failure
      if (state.answer === "yes") { setView("support"); return; }
      if (state.answer !== null) { navigate(next, { replace: true }); return; }
      setView("ask");
    };
    init();
  }, [navigate, next]);

  const answer = async (value: SafetyAnswer) => {
    if (!userId) return;
    await saveSafetyAnswer(userId, value);
    if (value === "yes") setView("support");
    else navigate(next, { replace: true });
  };

  const continueAnyway = async () => {
    if (userId) await saveSafetyAnswer(userId, "cleared");
    navigate(next, { replace: true });
  };

  const option =
    "w-full bg-white/15 backdrop-blur-sm border border-white/30 text-white text-base py-3.5 rounded-full hover:bg-white/25 active:scale-[0.98] transition-all duration-300";

  return (
    <div className="min-h-screen bg-sky-gradient relative overflow-hidden">
      <ThymosLogo />
      <OnboardingBackground />

      <div
        className="relative z-10 max-w-md mx-auto px-6 pb-16 flex flex-col justify-center min-h-screen"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 5rem)" }}
      >
        {view === "ask" && (
          <div className="text-center fade-in-up">
            <h1
              className="font-serif text-white text-3xl mb-4"
              style={{ textShadow: "0 2px 16px rgba(0,60,120,0.2)" }}
            >
              One private question
            </h1>
            <p className="text-white/70 text-base leading-relaxed mb-2">
              Before we connect you with someone, we ask everyone this.
            </p>
            <p className="text-white/50 text-sm leading-relaxed mb-10">
              Your answer is private. It never appears on your profile and never affects who you're
              matched with.
            </p>

            <p className="font-serif text-white text-2xl leading-snug mb-8">
              Are you currently having thoughts of harming yourself, or of not wanting to be alive?
            </p>

            <div className="space-y-3">
              <button className={option} onClick={() => answer("no")}>No</button>
              <button className={option} onClick={() => answer("yes")}>Yes</button>
              <button
                className="w-full text-white/50 text-sm py-3 hover:text-white/80 transition-colors"
                onClick={() => answer("declined")}
              >
                Prefer not to answer
              </button>
            </div>
          </div>
        )}

        {view === "support" && (
          <div className="fade-in-up">
            <h1
              className="font-serif text-white text-3xl mb-3 text-center"
              style={{ textShadow: "0 2px 16px rgba(0,60,120,0.2)" }}
            >
              Thank you for telling us
            </h1>
            <p className="text-white/70 text-base leading-relaxed text-center mb-8">
              You don't have to carry this alone. These services are free, confidential, and
              there right now.
            </p>

            <CrisisResources />

            <div className="mt-8 space-y-3">
              <button className={option} onClick={continueAnyway}>
                I'm safe right now — continue
              </button>
              <button
                className="w-full text-white/60 text-sm py-3 hover:text-white transition-colors"
                onClick={() => navigate("/home", { replace: true })}
              >
                Take me home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyCheck;
