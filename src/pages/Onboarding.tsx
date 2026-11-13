import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { SunIcon } from "@/components/icons/ThymosIcons";
import { ThemeTag } from "@/components/onboarding/ThemeTag";
import { LoadingState } from "@/components/onboarding/LoadingState";
import { useExtractThemes } from "@/hooks/useExtractThemes";
import { useOnboardingSubmit } from "@/hooks/useOnboardingSubmit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CodeEntry } from "@/components/auth/CodeEntry";
import { TermsContent, PrivacyContent } from "@/components/legal/LegalContent";
import { authRedirectUrl } from "@/lib/platform";
import {
  PRESET_STRUGGLES,
  PRESET_GOALS,
  PRESET_INTENTS,
  PRESET_OFFERS,
  CAPACITY_LEVELS,
  QUOTE_MAX_LENGTH,
} from "@/lib/onboardingOptions";

interface SuggestedTag {
  id: string;
  label: string;
  confidence: number;
}



// Sit before the name question (step 0) so the rest of the flow doesn't
// need renumbering.
const STEP_WHY = -2;
const STEP_FORK = -1;

// Steps that only show while something is happening. They never go on the
// back stack, and the back button is hidden while they're up.
const LOADING_STEPS = [2, 4, 6, 11];

// Ten dots, one per question screen. Loading screens keep the dot of the
// step they belong to; the help path jumps from the name to the email.
const PROGRESS_TOTAL = 10;
const frameFor = (step: number): { photo: boolean; progress: number } => {
  switch (step) {
    case STEP_WHY: return { photo: true, progress: 1 };
    case STEP_FORK: return { photo: false, progress: 2 };
    case 0: return { photo: false, progress: 3 };
    case 1: case 2: return { photo: false, progress: 4 };
    case 3: case 4: return { photo: false, progress: 5 };
    case 5: case 6: return { photo: false, progress: 6 };
    case 7: return { photo: false, progress: 7 };
    case 8: return { photo: false, progress: 8 };
    case 9: return { photo: false, progress: 9 };
    default: return { photo: false, progress: 10 };
  }
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { extractThemes } = useExtractThemes();
  const { saveOnboardingData } = useOnboardingSubmit();

  const [currentStep, setCurrentStep] = useState(STEP_WHY);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset selections (labels)
  const [selectedPresetStruggles, setSelectedPresetStruggles] = useState<string[]>([]);
  const [selectedPresetGoals, setSelectedPresetGoals] = useState<string[]>([]);
  const [selectedPresetIntents, setSelectedPresetIntents] = useState<string[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [capacityLevel, setCapacityLevel] = useState<string>("");
  const [quoteText, setQuoteText] = useState("");

  // Which fork card was tapped. "support" (or unset) is the full flow;
  // "help" skips straight from name to email and lands in Telos setup.
  const [entryPath, setEntryPath] = useState<"support" | "help" | null>(null);

  // Terms/Privacy open over onboarding rather than navigating away, so
  // nobody loses their answers by checking what they're agreeing to.
  const [legalOpen, setLegalOpen] = useState<"terms" | "privacy" | null>(null);

  // Custom text
  const [customStrugglesText, setCustomStrugglesText] = useState("");
  const [customGoalsText, setCustomGoalsText] = useState("");
  const [customIntentsText, setCustomIntentsText] = useState("");

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    intentText: "",
    goalsText: "",
    connectionText: "",
    suggestedStruggles: [] as SuggestedTag[],
    selectedStruggles: [] as string[],
    suggestedGoals: [] as SuggestedTag[],
    selectedGoals: [] as string[],
    suggestedIntents: [] as SuggestedTag[],
    selectedIntents: [] as string[],
  });

  // Already signed in — no reason to onboard again.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/home", { replace: true });
    });
  }, [navigate]);

  // Where the user has been, so the back button can retrace it. A ref tracks
  // the live step because async handlers call transitionTo from stale closures.
  const [history, setHistory] = useState<number[]>([]);
  const stepRef = useRef(STEP_WHY);

  const transitionTo = (step: number, opts?: { back?: boolean }) => {
    setIsTransitioning(true);
    setTimeout(() => {
      const from = stepRef.current;
      setHistory((h) => {
        if (opts?.back) return h.slice(0, -1);
        if (LOADING_STEPS.includes(from)) {
          // Returning from a loading screen to where we started (an error) pops it.
          return h[h.length - 1] === step ? h.slice(0, -1) : h;
        }
        return [...h, from];
      });
      stepRef.current = step;
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 300);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev !== undefined) transitionTo(prev, { back: true });
  };

  const togglePreset = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  // Merge preset selections with LLM-extracted tags
  const mergePresetAndExtracted = (
    presets: string[],
    extracted: SuggestedTag[] | null
  ): { suggested: SuggestedTag[]; selected: string[] } => {
    const tags: SuggestedTag[] = presets.map((label) => ({
      id: label.toLowerCase().replace(/\s+/g, "_"),
      label,
      confidence: 1,
    }));

    if (extracted) {
      for (const tag of extracted) {
        if (!tags.some((t) => t.id === tag.id)) {
          tags.push(tag);
        }
      }
    }

    return { suggested: tags, selected: tags.map((t) => t.id) };
  };

  // Step 0: Name
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userData.name.trim()) {
      // The "help" door skips straight to email — no struggles/goals/
      // intents/capacity/quote. Telos setup handles the rest post-signup.
      transitionTo(entryPath === "help" ? 10 : 1);
    }
  };

  // Step 1: Struggles → process
  const handleStrugglesSubmit = async () => {
    if (selectedPresetStruggles.length === 0 && !customStrugglesText.trim()) return;

    const hasCustom = customStrugglesText.trim().length > 0;

    if (hasCustom) {
      transitionTo(2); // loading
      const result = await extractThemes(customStrugglesText, "struggles");
      const merged = mergePresetAndExtracted(selectedPresetStruggles, result?.suggested_tags ?? null);
      setUserData((prev) => ({
        ...prev,
        intentText: customStrugglesText,
        suggestedStruggles: merged.suggested,
        selectedStruggles: merged.selected,
      }));
      transitionTo(3);
    } else {
      const merged = mergePresetAndExtracted(selectedPresetStruggles, null);
      setUserData((prev) => ({
        ...prev,
        intentText: selectedPresetStruggles.join(", "),
        suggestedStruggles: merged.suggested,
        selectedStruggles: merged.selected,
      }));
      transitionTo(3);
    }
  };

  // Step 3: Goals → process
  const handleGoalsSubmit = async () => {
    if (selectedPresetGoals.length === 0 && !customGoalsText.trim()) return;

    const hasCustom = customGoalsText.trim().length > 0;

    if (hasCustom) {
      transitionTo(4);
      const result = await extractThemes(customGoalsText, "goals");
      const merged = mergePresetAndExtracted(selectedPresetGoals, result?.suggested_tags ?? null);
      setUserData((prev) => ({
        ...prev,
        goalsText: customGoalsText,
        suggestedGoals: merged.suggested,
        selectedGoals: merged.selected,
      }));
      transitionTo(5);
    } else {
      const merged = mergePresetAndExtracted(selectedPresetGoals, null);
      setUserData((prev) => ({
        ...prev,
        goalsText: selectedPresetGoals.join(", "),
        suggestedGoals: merged.suggested,
        selectedGoals: merged.selected,
      }));
      transitionTo(5);
    }
  };

  // Step 5: Connection → process
  const handleConnectionSubmit = async () => {
    if (selectedPresetIntents.length === 0 && !customIntentsText.trim()) return;

    const hasCustom = customIntentsText.trim().length > 0;

    if (hasCustom) {
      transitionTo(6);
      const result = await extractThemes(customIntentsText, "connection_intent");
      const merged = mergePresetAndExtracted(selectedPresetIntents, result?.suggested_tags ?? null);
      setUserData((prev) => ({
        ...prev,
        connectionText: customIntentsText,
        suggestedIntents: merged.suggested,
        selectedIntents: merged.selected,
      }));
      transitionTo(7);
    } else {
      const merged = mergePresetAndExtracted(selectedPresetIntents, null);
      setUserData((prev) => ({
        ...prev,
        connectionText: selectedPresetIntents.join(", "),
        suggestedIntents: merged.suggested,
        selectedIntents: merged.selected,
      }));
      transitionTo(7);
    }
  };

  // Skips: goals/intents/capacity are optional. Struggles stays required —
  // it's the one signal matching can't work without.
  const handleGoalsSkip = () => {
    setUserData((prev) => ({ ...prev, goalsText: "", suggestedGoals: [], selectedGoals: [] }));
    transitionTo(5);
  };

  const handleIntentsSkip = () => {
    setUserData((prev) => ({ ...prev, connectionText: "", suggestedIntents: [], selectedIntents: [] }));
    transitionTo(7);
  };

  const handleCapacitySkip = () => {
    setCapacityLevel("");
    transitionTo(8);
  };

  // Step 7: Capacity/offers → process
  const handleCapacitySubmit = () => {
    if (!capacityLevel) return;
    transitionTo(8);
  };

  // Step 8: Quote → process
  const handleQuoteContinue = () => {
    transitionTo(9);
  };

  const handleQuoteSkip = () => {
    setQuoteText("");
    transitionTo(9);
  };

  const handleSummaryConfirm = () => {
    transitionTo(10);
  };

  const handleEmailSubmit = async () => {
    if (!userData.email.trim()) return;

    setIsSubmitting(true);
    transitionTo(11);

    try {
      // Probe first with shouldCreateUser:false. If it succeeds this email
      // already has an account (and Supabase has just sent them a sign-in
      // link), so send them down the sign-in path instead of creating a
      // duplicate. Only one email goes out either way.
      const probe = await supabase.auth.signInWithOtp({
        email: userData.email,
        options: {
          emailRedirectTo: authRedirectUrl(),
          shouldCreateUser: false,
        },
      });

      if (!probe.error) {
        setIsSubmitting(false);
        transitionTo(13);
        return;
      }

      if (probe.error.status === 429) {
        toast.error("Too many attempts. Wait a minute and try again.");
        transitionTo(10);
        setIsSubmitting(false);
        return;
      }

      // Probe failed for any other reason — treat as "no account yet" and
      // create it, carrying the onboarding answers in user metadata.
      const { error } = await supabase.auth.signInWithOtp({
        email: userData.email,
        options: {
          emailRedirectTo: authRedirectUrl(),
          data: {
            display_name: userData.name,
            raw_intent_text: userData.intentText,
            raw_goals_text: userData.goalsText,
            raw_connection_text: userData.connectionText,
            selected_struggles: userData.selectedStruggles,
            selected_goals: userData.selectedGoals,
            selected_intents: userData.selectedIntents,
            offer_tags: selectedOffers,
            capacity_level: capacityLevel,
            quote_text: quoteText.trim(),
            telos_first: entryPath === "help",
            terms_accepted_at: new Date().toISOString(),
            age_confirmed: true,
          },
        },
      });

      if (error) throw error;
      transitionTo(12);
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
      transitionTo(10);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userData.email.trim() && !isSubmitting) {
      handleEmailSubmit();
    }
  };

  const getSelectedLabels = (suggested: SuggestedTag[], selected: string[]): string[] => {
    return suggested.filter((t) => selected.includes(t.id)).map((t) => t.label);
  };

  // The summary sentence, as segments so every picked word can be tapped to
  // jump back to the question it came from.
  const summarySegments = [
    {
      lead: "You're carrying ",
      step: 1,
      items: getSelectedLabels(userData.suggestedStruggles, userData.selectedStruggles),
    },
    {
      lead: "reaching toward ",
      step: 3,
      items: getSelectedLabels(userData.suggestedGoals, userData.selectedGoals),
    },
    {
      lead: "and looking for ",
      step: 5,
      items: getSelectedLabels(userData.suggestedIntents, userData.selectedIntents),
    },
  ].filter((seg) => seg.items.length > 0);

  const canProceedStruggles = selectedPresetStruggles.length > 0;
  const canProceedGoals = selectedPresetGoals.length > 0 || customGoalsText.trim().length > 0;
  const canProceedIntents = selectedPresetIntents.length > 0 || customIntentsText.trim().length > 0;

  const frame = frameFor(currentStep);
  const anim = isTransitioning ? "step-fade-out" : "fade-in-up";
  const isLoading = LOADING_STEPS.includes(currentStep);
  const canGoBack = history.length > 0 && !isLoading && currentStep !== STEP_WHY;

  return (
    <>
      <OnboardingFrame
        photo={frame.photo}
        progress={{ current: frame.progress, total: PROGRESS_TOTAL }}
        onBack={canGoBack ? goBack : undefined}
      >
        {/* Greek-soul intro — full-clarity photo, lines fade in one by one */}
        {currentStep === STEP_WHY && (
          <div className={`th-on-sky text-center ${isTransitioning ? "step-fade-out" : ""}`}>
            <p className="th-reveal text-[1.05rem] leading-relaxed" style={{ animationDelay: "0.3s" }}>
              The ancient Greeks believed the soul
              <br />
              was divided into three parts:
            </p>
            <p className="th-reveal th-h1 mt-6 text-[1.35rem] italic" style={{ animationDelay: "1.4s", fontWeight: 400 }}>
              Reason — Logos
            </p>
            <p className="th-reveal th-h1 mt-2 text-[1.35rem] italic" style={{ animationDelay: "2.3s", fontWeight: 400 }}>
              Desire — Eros
            </p>
            <p
              className="th-reveal mx-auto mt-6 max-w-[17rem] text-[0.98rem] leading-relaxed"
              style={{ animationDelay: "3.4s" }}
            >
              Today, rationality and pleasure are put on a pedestal, while the third part of the soul — the core
              of our spirit, pride and dignity — has been forgotten.
            </p>
            <p
              className="th-reveal th-h1 mt-10 text-[2.2rem]"
              style={{ animationDelay: "4.8s", letterSpacing: "0.08em" }}
            >
              THYMOS
            </p>
            <button
              type="button"
              onClick={() => transitionTo(STEP_FORK)}
              aria-label="Continue"
              className="th-reveal th-icon-btn mx-auto mt-8"
              style={{ animationDelay: "6s", width: 46, height: 46 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        )}

        {/* Fork — which door are you here for */}
        {currentStep === STEP_FORK && (
          <div className={`th-card-lg ${anim}`}>
            <h1 className="th-h1 mb-6 text-[1.6rem]">What brings you here?</h1>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setEntryPath("support");
                  transitionTo(0);
                }}
                className="th-choice"
              >
                <p className="th-h1 text-[1.15rem]" style={{ fontWeight: 500, letterSpacing: "-0.01em" }}>Thymos</p>
                <p className="th-sub mt-1 text-[0.84rem] leading-snug">Connect with someone — to be heard, or to listen.</p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntryPath("help");
                  transitionTo(0);
                }}
                className="th-choice"
              >
                <p className="th-h1 text-[1.15rem]" style={{ fontWeight: 500, letterSpacing: "-0.01em" }}>Telos</p>
                <p className="th-sub mt-1 text-[0.84rem] leading-snug">Offer a skill, or ask for real help with something real.</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 0: Name */}
        {currentStep === 0 && (
          <div className={`th-card-lg ${anim}`}>
            <h1 className="th-h1 mb-6 text-[1.6rem]">What should we call you?</h1>
            <input
              type="text"
              placeholder="Your name"
              aria-label="Your name"
              value={userData.name}
              onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
              onKeyDown={handleNameKeyDown}
              className="th-field th-field-pill mb-5"
              autoFocus
            />
            <button
              type="button"
              className="th-btn"
              disabled={!userData.name.trim()}
              onClick={() => transitionTo(entryPath === "help" ? 10 : 1)}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 1: Struggles (required) */}
        {currentStep === 1 && (
          <div className={`th-card-lg ${anim}`}>
            <h1 className="th-h1 text-[1.5rem]">What's been weighing on you?</h1>
            <p className="th-sub mb-5 mt-2">Select what resonates, or add your own</p>
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {PRESET_STRUGGLES.map((tag) => (
                <ThemeTag
                  key={tag}
                  label={tag}
                  isSelected={selectedPresetStruggles.includes(tag)}
                  onClick={() => togglePreset(selectedPresetStruggles, setSelectedPresetStruggles, tag)}
                />
              ))}
            </div>
            <textarea
              value={customStrugglesText}
              onChange={(e) => setCustomStrugglesText(e.target.value)}
              placeholder="Something else on your mind…"
              aria-label="Something else on your mind"
              className="th-field mb-5 h-[88px] resize-none text-left"
            />
            <button type="button" className="th-btn" disabled={!canProceedStruggles} onClick={handleStrugglesSubmit}>
              Continue →
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className={isTransitioning ? "step-fade-out" : ""}>
            <LoadingState message="I hear you..." />
          </div>
        )}

        {/* Step 3: Goals */}
        {currentStep === 3 && (
          <div className={`th-card-lg ${anim}`}>
            <h1 className="th-h1 text-[1.5rem]">What are you reaching toward?</h1>
            <p className="th-sub mb-5 mt-2">There's no wrong answer here</p>
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {PRESET_GOALS.map((tag) => (
                <ThemeTag
                  key={tag}
                  label={tag}
                  isSelected={selectedPresetGoals.includes(tag)}
                  onClick={() => togglePreset(selectedPresetGoals, setSelectedPresetGoals, tag)}
                />
              ))}
            </div>
            <textarea
              value={customGoalsText}
              onChange={(e) => setCustomGoalsText(e.target.value)}
              placeholder="Something else you're working toward…"
              aria-label="Something else you're working toward"
              className="th-field mb-5 h-[88px] resize-none text-left"
            />
            <div className="flex flex-col items-center gap-3">
              <button type="button" className="th-btn" disabled={!canProceedGoals} onClick={handleGoalsSubmit}>
                Continue →
              </button>
              <button type="button" className="th-text-link" onClick={handleGoalsSkip}>
                Skip for now
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className={isTransitioning ? "step-fade-out" : ""}>
            <LoadingState message="I see what you're reaching for..." />
          </div>
        )}

        {/* Step 5: Connection intent */}
        {currentStep === 5 && (
          <div className={`th-card-lg ${anim}`}>
            <h1 className="th-h1 text-[1.5rem]">What kind of connection are you hoping for?</h1>
            <p className="th-sub mb-5 mt-2">This helps us find the right person for you</p>
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              {PRESET_INTENTS.map((tag) => (
                <ThemeTag
                  key={tag}
                  label={tag}
                  isSelected={selectedPresetIntents.includes(tag)}
                  onClick={() => togglePreset(selectedPresetIntents, setSelectedPresetIntents, tag)}
                />
              ))}
            </div>
            <textarea
              value={customIntentsText}
              onChange={(e) => setCustomIntentsText(e.target.value)}
              placeholder="Something else you're looking for…"
              aria-label="Something else you're looking for"
              className="th-field mb-5 h-[88px] resize-none text-left"
            />
            <div className="flex flex-col items-center gap-3">
              <button type="button" className="th-btn" disabled={!canProceedIntents} onClick={handleConnectionSubmit}>
                Continue →
              </button>
              <button type="button" className="th-text-link" onClick={handleIntentsSkip}>
                Skip for now
              </button>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className={isTransitioning ? "step-fade-out" : ""}>
            <LoadingState message="Finding what resonates..." />
          </div>
        )}

        {/* Step 7: What you can offer + how much room you have */}
        {currentStep === 7 && (
          <div className={`th-card-lg ${anim}`}>
            <h1 className="th-h1 text-[1.45rem]">What can you offer someone else right now?</h1>
            <p className="th-sub mb-5 mt-2">Select what feels true</p>
            <div className="flex flex-wrap justify-center gap-2">
              {PRESET_OFFERS.map((tag) => (
                <ThemeTag
                  key={tag}
                  label={tag}
                  isSelected={selectedOffers.includes(tag)}
                  onClick={() => togglePreset(selectedOffers, setSelectedOffers, tag)}
                />
              ))}
            </div>
            <p className="mb-3 mt-6 text-[0.78rem] tracking-[0.02em] text-[color:var(--th-text-3)]">
              How much room do you have for someone else right now?
            </p>
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {CAPACITY_LEVELS.map((level) => (
                <ThemeTag
                  key={level.value}
                  label={level.label}
                  isSelected={capacityLevel === level.value}
                  onClick={() => setCapacityLevel(level.value)}
                />
              ))}
            </div>
            <div className="flex flex-col items-center gap-3">
              <button type="button" className="th-btn" disabled={!capacityLevel} onClick={handleCapacitySubmit}>
                Continue →
              </button>
              <button type="button" className="th-text-link" onClick={handleCapacitySkip}>
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 8: One thing you wish someone understood (optional) */}
        {currentStep === 8 && (
          <div className={`th-card-lg ${anim}`}>
            <h1 className="th-h1 text-[1.4rem]">
              What's one thing you wish someone understood about where you are right now?
            </h1>
            <p className="th-sub mb-5 mt-2">Optional — this is shown to whoever you're matched with</p>
            <textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value.slice(0, QUOTE_MAX_LENGTH))}
              placeholder="I'm surrounded by people, but I still feel like nobody really knows what I'm going through…"
              aria-label="One thing you wish someone understood"
              maxLength={QUOTE_MAX_LENGTH}
              className="th-field h-[110px] resize-none text-left"
            />
            <p className="mb-5 mt-2 text-right text-xs text-[color:var(--th-text-3)]">
              {quoteText.length}/{QUOTE_MAX_LENGTH}
            </p>
            <div className="flex flex-col items-center gap-3">
              {quoteText.trim().length > 0 && (
                <button type="button" className="th-btn" onClick={handleQuoteContinue}>
                  Continue →
                </button>
              )}
              <button type="button" className="th-text-link" onClick={handleQuoteSkip}>
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 9: One flowing sentence; every picked word is tappable */}
        {currentStep === 9 && (
          <div className={`th-card-lg ${anim}`}>
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "#E3EAF1" }}
            >
              <SunIcon color="#C98F4A" width={28} height={28} />
            </div>
            <h1 className="th-h1 text-[1.5rem]">Here's what I'm hearing…</h1>
            <p className="th-h1 mx-auto mb-4 mt-4 max-w-[19rem] text-[1.25rem] italic leading-[1.5]" style={{ fontWeight: 400, letterSpacing: "-0.01em" }}>
              {summarySegments.map((seg, i) => (
                <span key={seg.step}>
                  {i > 0 ? ", " : ""}
                  {seg.lead}
                  {seg.items.map((label, j) => (
                    <span key={`${label}-${j}`}>
                      {j > 0 ? (j === seg.items.length - 1 ? " and " : ", ") : ""}
                      <button
                        type="button"
                        className="th-summary-word"
                        aria-label={`Change ${label}`}
                        onClick={() => transitionTo(seg.step)}
                      >
                        {label.toLowerCase()}
                      </button>
                    </span>
                  ))}
                </span>
              ))}
              .
            </p>
            <p className="th-sub mb-6 text-[0.85rem]">Tap any word to change it</p>
            <button type="button" className="th-btn" onClick={handleSummaryConfirm}>
              Yes, that's me →
            </button>
          </div>
        )}

        {/* Step 10: Email */}
        {currentStep === 10 && (
          <div className={`th-card-lg ${anim}`}>
            <h1 className="th-h1 text-[1.5rem]">Last step — let's save your journey</h1>
            <p className="th-sub mb-5 mt-2">We'll send you a magic link to confirm</p>
            <input
              type="email"
              placeholder="your@email.com"
              aria-label="Your email"
              value={userData.email}
              onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))}
              onKeyDown={handleEmailKeyDown}
              disabled={isSubmitting}
              className="th-field th-field-pill mb-4 disabled:opacity-50"
              autoFocus
            />
            <button
              type="button"
              className="th-btn"
              onClick={handleEmailSubmit}
              disabled={isSubmitting || !userData.email.trim()}
            >
              Continue →
            </button>
            <p className="th-sub mt-3 text-[0.78rem]">press enter ↵</p>
            <p className="mx-auto mt-4 max-w-xs text-xs leading-relaxed text-[color:var(--th-text-3)]">
              By continuing you confirm you're 18 or older and agree to our{" "}
              <button type="button" onClick={() => setLegalOpen("terms")} className="underline underline-offset-2 hover:text-[color:var(--th-ink)]">
                Terms
              </button>{" "}
              and{" "}
              <button type="button" onClick={() => setLegalOpen("privacy")} className="underline underline-offset-2 hover:text-[color:var(--th-ink)]">
                Privacy Policy
              </button>
              .
            </p>
          </div>
        )}

        {currentStep === 11 && (
          <div className={isTransitioning ? "step-fade-out" : ""}>
            <LoadingState message="Creating your space..." />
          </div>
        )}

        {/* Step 12: Check your email */}
        {currentStep === 12 && (
          <div className={`th-card-lg ${anim}`}>
            <h1 className="th-h1 mb-3 text-[1.6rem]">Check your email</h1>
            <p className="th-sub">
              We sent a link to <span className="font-medium text-[color:var(--th-ink)]">{userData.email}</span>
              <br />
              Tap it to complete your profile
            </p>
            <CodeEntry email={userData.email.trim()} tone="glass" />
            <button type="button" onClick={() => navigate("/")} className="th-text-link mt-5">
              I'll check later →
            </button>
          </div>
        )}

        {/* Step 13: This email already has an account */}
        {currentStep === 13 && (
          <div className={`th-card-lg ${anim}`}>
            <h1 className="th-h1 mb-3 text-[1.6rem]">You're already with us</h1>
            <p className="th-sub">
              <span className="font-medium text-[color:var(--th-ink)]">{userData.email}</span> already has an
              account, so we sent a sign-in link instead.
            </p>
            <CodeEntry email={userData.email.trim()} tone="glass" />
            <button type="button" onClick={() => navigate("/login")} className="th-text-link mt-5">
              Use a different email →
            </button>
          </div>
        )}
      </OnboardingFrame>

      {/* Terms / Privacy open over onboarding so nobody loses their answers */}
      {legalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#F7F5F1]" role="dialog" aria-modal="true" aria-label={legalOpen === "terms" ? "Terms of Use" : "Privacy Policy"}>
          <div className="th-ambient" aria-hidden="true" />
          <div className="th-brand-mark">THYMOS</div>
          <div className="th-topbar" style={{ justifyContent: "flex-start" }}>
            <button
              type="button"
              onClick={() => setLegalOpen(null)}
              className="th-icon-btn"
              style={{ width: 34, height: 34 }}
              aria-label="Back to sign up"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div
            className="relative z-10 mx-auto max-w-xl px-5 pt-6"
            style={{ paddingBottom: "max(40px, env(safe-area-inset-bottom))" }}
          >
            <div className="th-sheet th-legal-paper px-6 py-8">
              {legalOpen === "terms" ? <TermsContent /> : <PrivacyContent />}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Onboarding;
