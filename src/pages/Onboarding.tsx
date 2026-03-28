import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { ThemeTag } from "@/components/onboarding/ThemeTag";
import { LoadingState } from "@/components/onboarding/LoadingState";
import ThymosLogo from "@/components/ThymosLogo";
import { useExtractThemes } from "@/hooks/useExtractThemes";
import { useOnboardingSubmit } from "@/hooks/useOnboardingSubmit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SuggestedTag {
  id: string;
  label: string;
  confidence: number;
}

// Preset tags for each category
const PRESET_STRUGGLES = [
  "Anxiety", "Loneliness", "Self-doubt", "Burnout",
  "Grief", "Relationship struggles", "Identity", "Depression",
  "Overwhelm", "Anger",
];

const PRESET_GOALS = [
  "Inner peace", "Confidence", "Self-acceptance", "Better boundaries",
  "Emotional awareness", "Resilience", "Purpose", "Patience",
  "Letting go", "Vulnerability",
];

const PRESET_INTENTS = [
  "A listener", "Mutual support", "Accountability partner",
  "Someone who gets it", "Honest conversations", "Growth together",
  "Non-judgmental space", "Shared experiences",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { extractThemes } = useExtractThemes();
  const { saveOnboardingData } = useOnboardingSubmit();

  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset selections (labels)
  const [selectedPresetStruggles, setSelectedPresetStruggles] = useState<string[]>([]);
  const [selectedPresetGoals, setSelectedPresetGoals] = useState<string[]>([]);
  const [selectedPresetIntents, setSelectedPresetIntents] = useState<string[]>([]);

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
      transitionTo(1);
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
    transitionTo(8);
  };

  const handleEmailSubmit = async () => {
    if (!userData.email.trim()) return;

    setIsSubmitting(true);
    transitionTo(9);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: userData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: userData.name,
            raw_intent_text: userData.intentText,
            raw_goals_text: userData.goalsText,
            raw_connection_text: userData.connectionText,
            selected_struggles: userData.selectedStruggles,
            selected_goals: userData.selectedGoals,
            selected_intents: userData.selectedIntents,
          },
        },
      });

      if (error) throw error;
      transitionTo(10);
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
      transitionTo(8);
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

  const canProceedStruggles = selectedPresetStruggles.length > 0 || customStrugglesText.trim().length > 0;
  const canProceedGoals = selectedPresetGoals.length > 0 || customGoalsText.trim().length > 0;
  const canProceedIntents = selectedPresetIntents.length > 0 || customIntentsText.trim().length > 0;

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
      <ThymosLogo />
      <OnboardingBackground />

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
            Select what resonates, or add your own
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
            placeholder="Something else on your mind..."
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

          {canProceedGoals && (
            <button
              onClick={handleGoalsSubmit}
              className="stagger-fade-in mt-5 text-foreground/70 font-serif text-lg hover:text-foreground transition-all duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              Continue →
            </button>
          )}
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

          {canProceedIntents && (
            <button
              onClick={handleConnectionSubmit}
              className="stagger-fade-in mt-5 text-foreground/70 font-serif text-lg hover:text-foreground transition-all duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              Continue →
            </button>
          )}
        </div>
      )}

      {/* Step 6: Loading */}
      {currentStep === 6 && (
        <div className={`relative z-10 ${isTransitioning ? "step-fade-out" : ""}`}>
          <LoadingState message="Finding what resonates..." />
        </div>
      )}

      {/* Step 7: Summary */}
      {currentStep === 7 && (
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

      {/* Step 8: Email */}
      {currentStep === 8 && (
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
          </div>
        </div>
      )}

      {/* Step 9: Loading */}
      {currentStep === 9 && (
        <div className={`relative z-10 ${isTransitioning ? "step-fade-out" : ""}`}>
          <LoadingState message="Creating your space..." />
        </div>
      )}

      {/* Step 10: Success */}
      {currentStep === 10 && (
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

          <button
            onClick={() => navigate("/")}
            className="stagger-fade-in text-foreground/50 font-serif text-sm hover:text-foreground/70 transition-all duration-300"
            style={{ animationDelay: "0.4s" }}
          >
            I'll check later →
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
