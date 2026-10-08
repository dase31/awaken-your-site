import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { ThemeTag } from "@/components/onboarding/ThemeTag";
import { LoadingState } from "@/components/onboarding/LoadingState";
import ThymosLogo from "@/components/ThymosLogo";
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

  const transitionTo = (step: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 300);
  };

  const togglePreset = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
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

  // Toggle functions for summary
  const toggleStruggle = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      selectedStruggles: prev.selectedStruggles.includes(id)
        ? prev.selectedStruggles.filter((s) => s !== id)
        : [...prev.selectedStruggles, id],
    }));
  };

  const toggleGoal = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(id)
        ? prev.selectedGoals.filter((g) => g !== id)
        : [...prev.selectedGoals, id],
    }));
  };

  const toggleIntent = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      selectedIntents: prev.selectedIntents.includes(id)
        ? prev.selectedIntents.filter((i) => i !== id)
        : [...prev.selectedIntents, id],
    }));
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

  const buildSummarySentence = () => {
    const struggles = getSelectedLabels(userData.suggestedStruggles, userData.selectedStruggles);
    const goals = getSelectedLabels(userData.suggestedGoals, userData.selectedGoals);
    const intents = getSelectedLabels(userData.suggestedIntents, userData.selectedIntents);

    const formatList = (items: string[]) => {
      if (items.length === 0) return "";
      if (items.length === 1) return items[0].toLowerCase();
      if (items.length === 2) return `${items[0].toLowerCase()} and ${items[1].toLowerCase()}`;
      return `${items.slice(0, -1).map((i) => i.toLowerCase()).join(", ")}, and ${items[items.length - 1].toLowerCase()}`;
    };

    const parts: string[] = [];
    if (struggles.length > 0) parts.push(`You're carrying ${formatList(struggles)}`);
    if (goals.length > 0) parts.push(`reaching toward ${formatList(goals)}`);
    if (intents.length > 0) parts.push(`and looking for ${formatList(intents)}`);

    return parts.join(", ") + ".";
  };

  const canProceedStruggles = selectedPresetStruggles.length > 0;
  const canProceedGoals = selectedPresetGoals.length > 0 || customGoalsText.trim().length > 0;
  const canProceedIntents = selectedPresetIntents.length > 0 || customIntentsText.trim().length > 0;

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
      {/* Hidden on the Why step so the wordmark's reveal isn't pre-empted */}
      {currentStep !== STEP_WHY && <ThymosLogo />}
      <OnboardingBackground />

      {/* Step -1: Why Thymos */}
      {currentStep === STEP_WHY && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <p
            className="stagger-fade-in font-serif text-foreground/80 text-xl md:text-2xl leading-relaxed"
            style={{ animationDelay: "0.3s", textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
          >
            The ancient Greeks believed the soul was divided into three parts:
          </p>

          <div className="my-10 space-y-4">
            <p
              className="stagger-fade-in font-serif text-foreground text-2xl md:text-3xl"
              style={{ animationDelay: "1.4s", textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
            >
              Reason — <span className="tracking-[0.15em]">LOGOS</span>
            </p>
            <p
              className="stagger-fade-in font-serif text-foreground text-2xl md:text-3xl"
              style={{ animationDelay: "2.3s", textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
            >
              Desire — <span className="tracking-[0.15em]">EROS</span>
            </p>
          </div>

          <p
            className="stagger-fade-in font-serif text-foreground/70 text-lg md:text-xl leading-relaxed"
            style={{ animationDelay: "3.4s", textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
          >
            Today, rationality and pleasure are put on a pedestal, while the third
            part of the soul: the core of our spirit, pride, and dignity has been
            forgotten.
          </p>

          <p
            className="stagger-fade-in text-foreground text-3xl md:text-4xl font-medium tracking-[0.3em] uppercase mt-14"
            style={{ animationDelay: "4.8s", textShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
          >
            Thymos
          </p>

          <button
            type="button"
            onClick={() => transitionTo(STEP_FORK)}
            aria-label="Continue"
            className="stagger-fade-in group relative mx-auto mt-16 flex h-16 w-16 items-center justify-center"
            style={{ animationDelay: "6s" }}
          >
            {/* Radiating ring — the "magic" pulse */}
            <span className="absolute inset-0 rounded-full border border-white/40 animate-ping opacity-40 motion-reduce:animate-none" />
            <span className="absolute inset-0 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 transition-all duration-300 group-hover:bg-white/25 group-active:scale-95" />
            <span className="relative font-serif text-foreground text-xl leading-none">
              →
            </span>
          </button>
        </div>
      )}

      {/* Step -1: Fork — which door are you here for */}
      {currentStep === STEP_FORK && (
        <div
          className={`relative z-10 text-center px-6 max-w-md w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1
            className="stagger-fade-in font-serif text-foreground text-2xl md:text-3xl leading-relaxed mb-10"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
          >
            What brings you here?
          </h1>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setEntryPath("support");
                transitionTo(0);
              }}
              className="stagger-fade-in w-full text-left backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-5 active:scale-[0.98] transition-all duration-300 hover:brightness-110"
              style={{ animationDelay: "0.15s", background: "hsl(200, 60%, 40%)" }}
            >
              <p className="font-serif text-foreground text-xl mb-1.5">Thymos</p>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Connect with someone — to be heard, or to listen.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setEntryPath("help");
                transitionTo(0);
              }}
              className="stagger-fade-in w-full text-left backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-5 active:scale-[0.98] transition-all duration-300 hover:brightness-110"
              style={{ animationDelay: "0.3s", background: "hsl(200, 60%, 40%)" }}
            >
              <p className="font-serif text-foreground text-xl mb-1.5">Telos</p>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Offer a skill, or ask for real help with something real.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Step 0: Name */}
      {currentStep === 0 && (
        <div
          className={`relative z-10 text-center px-6 max-w-md w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-3xl md:text-4xl lg:text-5xl leading-relaxed mb-8">
            What should we call you?
          </h1>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={userData.name}
              onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
              onKeyDown={handleNameKeyDown}
              className="ethereal-input bg-transparent border-none text-foreground text-2xl md:text-3xl font-serif text-center w-full focus:outline-none placeholder:text-foreground/40"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
              autoFocus
            />
            <p className="hint-fade-in text-foreground/50 text-sm">press enter ↵</p>
          </div>
        </div>
      )}

      {/* Step 1: Struggles - Hybrid */}
      {currentStep === 1 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-2xl md:text-3xl leading-relaxed mb-3 stagger-fade-in">
            What's been weighing on you?
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-base mb-6 font-serif"
            style={{ animationDelay: "0.15s" }}
          >
            Select what resonates, then add more if you like
          </p>

          <div
            className="stagger-fade-in flex flex-wrap justify-center gap-2 mb-6"
            style={{ animationDelay: "0.25s" }}
          >
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
            placeholder="Anything else on your mind..."
            className="stagger-fade-in w-full min-h-[80px] bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-foreground text-base font-serif placeholder:text-foreground/30 focus:outline-none focus:border-white/20 resize-none"
            style={{ animationDelay: "0.35s", textShadow: "0 1px 8px rgba(0,0,0,0.1)" }}
          />

          {canProceedStruggles && (
            <button
              onClick={handleStrugglesSubmit}
              className="stagger-fade-in mt-5 text-foreground/70 font-serif text-lg hover:text-foreground transition-all duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              Continue →
            </button>
          )}
        </div>
      )}

      {/* Step 2: Loading */}
      {currentStep === 2 && (
        <div className={`relative z-10 ${isTransitioning ? "step-fade-out" : ""}`}>
          <LoadingState message="I hear you..." />
        </div>
      )}

      {/* Step 3: Goals - Hybrid */}
      {currentStep === 3 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-2xl md:text-3xl leading-relaxed mb-3 stagger-fade-in">
            What are you reaching toward?
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-base mb-6 font-serif"
            style={{ animationDelay: "0.15s" }}
          >
            There's no wrong answer here
          </p>

          <div
            className="stagger-fade-in flex flex-wrap justify-center gap-2 mb-6"
            style={{ animationDelay: "0.25s" }}
          >
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
            placeholder="Something else you're working toward..."
            className="stagger-fade-in w-full min-h-[80px] bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-foreground text-base font-serif placeholder:text-foreground/30 focus:outline-none focus:border-white/20 resize-none"
            style={{ animationDelay: "0.35s", textShadow: "0 1px 8px rgba(0,0,0,0.1)" }}
          />

          <div className="mt-5 flex items-center justify-center gap-6">
            {canProceedGoals && (
              <button
                onClick={handleGoalsSubmit}
                className="stagger-fade-in text-foreground/70 font-serif text-lg hover:text-foreground transition-all duration-300"
                style={{ animationDelay: "0.4s" }}
              >
                Continue →
              </button>
            )}
            <button
              onClick={handleGoalsSkip}
              className="stagger-fade-in font-serif text-base text-foreground/40 hover:text-foreground/60 transition-all duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Loading */}
      {currentStep === 4 && (
        <div className={`relative z-10 ${isTransitioning ? "step-fade-out" : ""}`}>
          <LoadingState message="I see what you're reaching for..." />
        </div>
      )}

      {/* Step 5: Connection Intent - Hybrid */}
      {currentStep === 5 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-2xl md:text-3xl leading-relaxed mb-3 stagger-fade-in">
            What kind of connection are you hoping for?
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-base mb-6 font-serif"
            style={{ animationDelay: "0.15s" }}
          >
            This helps us find the right person for you
          </p>

          <div
            className="stagger-fade-in flex flex-wrap justify-center gap-2 mb-6"
            style={{ animationDelay: "0.25s" }}
          >
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
            placeholder="Something else you're looking for..."
            className="stagger-fade-in w-full min-h-[80px] bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-foreground text-base font-serif placeholder:text-foreground/30 focus:outline-none focus:border-white/20 resize-none"
            style={{ animationDelay: "0.35s", textShadow: "0 1px 8px rgba(0,0,0,0.1)" }}
          />

          <div className="mt-5 flex items-center justify-center gap-6">
            {canProceedIntents && (
              <button
                onClick={handleConnectionSubmit}
                className="stagger-fade-in text-foreground/70 font-serif text-lg hover:text-foreground transition-all duration-300"
                style={{ animationDelay: "0.4s" }}
              >
                Continue →
              </button>
            )}
            <button
              onClick={handleIntentsSkip}
              className="stagger-fade-in font-serif text-base text-foreground/40 hover:text-foreground/60 transition-all duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Loading */}
      {currentStep === 6 && (
        <div className={`relative z-10 ${isTransitioning ? "step-fade-out" : ""}`}>
          <LoadingState message="Finding what resonates..." />
        </div>
      )}

      {/* Step 7: Capacity / What you can offer */}
      {currentStep === 7 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-2xl md:text-3xl leading-relaxed mb-3 stagger-fade-in">
            What can you offer someone else right now?
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-base mb-6 font-serif"
            style={{ animationDelay: "0.15s" }}
          >
            Select what feels true
          </p>

          <div
            className="stagger-fade-in flex flex-wrap justify-center gap-2 mb-10"
            style={{ animationDelay: "0.25s" }}
          >
            {PRESET_OFFERS.map((tag) => (
              <ThemeTag
                key={tag}
                label={tag}
                isSelected={selectedOffers.includes(tag)}
                onClick={() => togglePreset(selectedOffers, setSelectedOffers, tag)}
              />
            ))}
          </div>

          <p
            className="stagger-fade-in text-foreground/60 text-base mb-4 font-serif"
            style={{ animationDelay: "0.3s" }}
          >
            How much room do you have for someone else right now?
          </p>

          <div
            className="stagger-fade-in flex flex-wrap justify-center gap-2 mb-6"
            style={{ animationDelay: "0.35s" }}
          >
            {CAPACITY_LEVELS.map((level) => (
              <ThemeTag
                key={level.value}
                label={level.label}
                isSelected={capacityLevel === level.value}
                onClick={() => setCapacityLevel(level.value)}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-center gap-6">
            {capacityLevel && (
              <button
                onClick={handleCapacitySubmit}
                className="stagger-fade-in text-foreground/70 font-serif text-lg hover:text-foreground transition-all duration-300"
                style={{ animationDelay: "0.4s" }}
              >
                Continue →
              </button>
            )}
            <button
              onClick={handleCapacitySkip}
              className="stagger-fade-in font-serif text-base text-foreground/40 hover:text-foreground/60 transition-all duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Step 8: Quote for the match reveal */}
      {currentStep === 8 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-2xl md:text-3xl leading-relaxed mb-3 stagger-fade-in">
            What's one thing you wish someone understood about where you are right now?
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-base mb-6 font-serif"
            style={{ animationDelay: "0.15s" }}
          >
            Optional — this is shown to whoever you're matched with
          </p>

          <textarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value.slice(0, QUOTE_MAX_LENGTH))}
            placeholder="I'm surrounded by people, but I still feel like nobody really knows what I'm going through..."
            maxLength={QUOTE_MAX_LENGTH}
            className="stagger-fade-in w-full min-h-[100px] bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-foreground text-base font-serif placeholder:text-foreground/30 focus:outline-none focus:border-white/20 resize-none"
            style={{ animationDelay: "0.25s", textShadow: "0 1px 8px rgba(0,0,0,0.1)" }}
          />
          <p
            className="stagger-fade-in text-foreground/30 text-xs mt-2 text-right"
            style={{ animationDelay: "0.3s" }}
          >
            {quoteText.length}/{QUOTE_MAX_LENGTH}
          </p>

          <div className="flex items-center justify-center gap-6 mt-5">
            {quoteText.trim().length > 0 && (
              <button
                onClick={handleQuoteContinue}
                className="stagger-fade-in font-serif text-lg text-foreground/70 hover:text-foreground transition-all duration-300"
                style={{ animationDelay: "0.4s" }}
              >
                Continue →
              </button>
            )}
            <button
              onClick={handleQuoteSkip}
              className="stagger-fade-in font-serif text-base text-foreground/40 hover:text-foreground/60 transition-all duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Step 9: Summary */}
      {currentStep === 9 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-2xl md:text-3xl leading-relaxed mb-6 stagger-fade-in">
            Here's what I'm hearing...
          </h1>

          <p
            className="stagger-fade-in text-foreground/80 text-lg md:text-xl mb-8 font-serif italic leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            {buildSummarySentence()}
          </p>

          <p
            className="stagger-fade-in text-foreground/50 text-sm mb-6 font-serif"
            style={{ animationDelay: "0.3s" }}
          >
            Tap to adjust anything that doesn't feel right
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8" style={{ animationDelay: "0.4s" }}>
            {userData.suggestedStruggles.map((tag, index) => (
              <ThemeTag
                key={`struggle-${tag.id}`}
                label={tag.label}
                isSelected={userData.selectedStruggles.includes(tag.id)}
                onClick={() => toggleStruggle(tag.id)}
                animationDelay={0.4 + index * 0.05}
              />
            ))}
            {userData.suggestedGoals.map((tag, index) => (
              <ThemeTag
                key={`goal-${tag.id}`}
                label={tag.label}
                isSelected={userData.selectedGoals.includes(tag.id)}
                onClick={() => toggleGoal(tag.id)}
                animationDelay={0.5 + index * 0.05}
              />
            ))}
            {userData.suggestedIntents.map((tag, index) => (
              <ThemeTag
                key={`intent-${tag.id}`}
                label={tag.label}
                isSelected={userData.selectedIntents.includes(tag.id)}
                onClick={() => toggleIntent(tag.id)}
                animationDelay={0.6 + index * 0.05}
              />
            ))}
          </div>

          <button
            onClick={handleSummaryConfirm}
            className="stagger-fade-in text-foreground font-serif text-lg hover:text-foreground/80 transition-all duration-300"
            style={{ animationDelay: "0.7s" }}
          >
            Yes, that's me →
          </button>
        </div>
      )}

      {/* Step 10: Email */}
      {currentStep === 10 && (
        <div
          className={`relative z-10 text-center px-6 max-w-md w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-3xl md:text-4xl leading-relaxed mb-4 stagger-fade-in">
            Last step — let's save your journey
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-lg mb-8 font-serif"
            style={{ animationDelay: "0.2s" }}
          >
            We'll send you a magic link to confirm
          </p>

          <div className="space-y-4" style={{ animationDelay: "0.3s" }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={userData.email}
              onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))}
              onKeyDown={handleEmailKeyDown}
              disabled={isSubmitting}
              className="stagger-fade-in ethereal-input bg-transparent border-none text-foreground text-2xl md:text-3xl font-serif text-center w-full focus:outline-none placeholder:text-foreground/40 disabled:opacity-50"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
              autoFocus
            />

            {userData.email.trim() && (
              <button
                onClick={handleEmailSubmit}
                disabled={isSubmitting}
                className="stagger-fade-in text-foreground/70 font-serif text-lg hover:text-foreground transition-all duration-300 disabled:opacity-50"
                style={{ animationDelay: "0.4s" }}
              >
                Continue →
              </button>
            )}

            <p className="stagger-fade-in text-foreground/40 text-sm" style={{ animationDelay: "0.5s" }}>
              press enter ↵
            </p>

            <p
              className="stagger-fade-in text-foreground/45 text-xs leading-relaxed max-w-xs mx-auto pt-4"
              style={{ animationDelay: "0.6s" }}
            >
              By continuing you confirm you're 18 or older and agree to our{" "}
              <button type="button" onClick={() => setLegalOpen("terms")} className="underline underline-offset-2 hover:text-foreground/70">
                Terms
              </button>{" "}
              and{" "}
              <button type="button" onClick={() => setLegalOpen("privacy")} className="underline underline-offset-2 hover:text-foreground/70">
                Privacy Policy
              </button>.
            </p>
          </div>
        </div>
      )}

      {/* Step 11: Loading */}
      {currentStep === 11 && (
        <div className={`relative z-10 ${isTransitioning ? "step-fade-out" : ""}`}>
          <LoadingState message="Creating your space..." />
        </div>
      )}

      {/* Step 12: Success */}
      {currentStep === 12 && (
        <div
          className={`relative z-10 text-center px-6 max-w-md w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-3xl md:text-4xl leading-relaxed mb-4 stagger-fade-in">
            Check your email
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-lg mb-8 font-serif"
            style={{ animationDelay: "0.2s" }}
          >
            We sent a link to <span className="text-foreground">{userData.email}</span>
            <br />
            Tap it to complete your profile
          </p>

          <div className="stagger-fade-in" style={{ animationDelay: "0.3s" }}>
            <CodeEntry email={userData.email.trim()} />
          </div>

          <button
            onClick={() => navigate("/")}
            className="stagger-fade-in text-foreground/50 font-serif text-sm hover:text-foreground/70 transition-all duration-300"
            style={{ animationDelay: "0.4s" }}
          >
            I'll check later →
          </button>
        </div>
      )}

      {/* Step 13: Email already has an account */}
      {currentStep === 13 && (
        <div
          className={`relative z-10 text-center px-6 max-w-md w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-3xl md:text-4xl leading-relaxed mb-4 stagger-fade-in">
            You're already with us
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-lg mb-8 font-serif leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="text-foreground">{userData.email}</span> already has
            an account, so we sent a sign-in link instead.
          </p>

          <div className="stagger-fade-in" style={{ animationDelay: "0.3s" }}>
            <CodeEntry email={userData.email.trim()} />
          </div>

          <button
            onClick={() => navigate("/login")}
            className="stagger-fade-in text-foreground/70 font-serif text-lg hover:text-foreground transition-all duration-300"
            style={{ animationDelay: "0.35s" }}
          >
            Use a different email →
          </button>
        </div>
      )}

      {legalOpen && (
        <div className="fixed inset-0 z-50 bg-sky-gradient overflow-y-auto" role="dialog" aria-modal="true">
          <div className="max-w-xl mx-auto px-6 pt-16 pb-24">
            <button
              onClick={() => setLegalOpen(null)}
              className="mb-8 text-white/70 text-sm hover:text-white transition-colors"
            >
              ← Back to sign up
            </button>
            <div className="bg-[hsl(205,55%,28%)]/55 backdrop-blur-xl border border-white/15 rounded-3xl px-6 py-8">
              {legalOpen === "terms" ? <TermsContent /> : <PrivacyContent />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
