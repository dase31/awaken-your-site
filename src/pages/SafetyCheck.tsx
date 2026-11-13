import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
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

  return (
    <OnboardingFrame hideChrome>
      {view === "ask" && (
        <div className="th-card-lg fade-in-up">
          <h1 className="th-h1 text-[1.7rem]">One private question</h1>
          <p className="th-sub mb-1 mt-3">Before we connect you with someone, we ask everyone this.</p>
          <p className="mb-6 text-[0.8rem] leading-relaxed text-[color:var(--th-text-3)]">
            Your answer is private. It never appears on your profile and never affects who you're matched with.
          </p>

          <p className="th-h1 mx-auto mb-7 max-w-[19rem] text-[1.3rem] leading-snug">
            Are you currently having thoughts of harming yourself, or of not wanting to be alive?
          </p>

          <div className="mx-auto flex max-w-[16rem] flex-col gap-3">
            <button type="button" className="th-pill th-chip py-3 text-[0.92rem]" onClick={() => answer("no")}>
              No
            </button>
            <button type="button" className="th-pill th-chip py-3 text-[0.92rem]" onClick={() => answer("yes")}>
              Yes
            </button>
            <button type="button" className="th-text-link mt-1" onClick={() => answer("declined")}>
              Prefer not to answer
            </button>
          </div>
        </div>
      )}

      {view === "support" && (
        <div className="fade-in-up">
          <div className="th-card-lg mb-3">
            <h1 className="th-h1 text-[1.7rem]">Thank you for telling us</h1>
            <p className="th-sub mt-3">
              You don't have to carry this alone. These services are free, confidential, and there right now.
            </p>
          </div>

          <CrisisResources />

          <div className="mt-5 flex flex-col items-center gap-3">
            <button type="button" className="th-btn" onClick={continueAnyway}>
              I'm safe right now — continue
            </button>
            <button
              type="button"
              className="th-on-sky text-sm opacity-90 hover:opacity-100"
              onClick={() => navigate("/home", { replace: true })}
            >
              Take me home
            </button>
          </div>
        </div>
      )}
    </OnboardingFrame>
  );
};

export default SafetyCheck;
