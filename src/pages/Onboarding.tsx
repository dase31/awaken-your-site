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

const Onboarding = () => {
  const navigate = useNavigate();
  const { extractThemes } = useExtractThemes();
  const { saveOnboardingData } = useOnboardingSubmit();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Step 0: Name
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userData.name.trim()) {
      transitionTo(1);
    }
  };

  // Step 1: Intent → Step 2 (loading) → Step 3 (goals)
  const handleIntentSubmit = async () => {
    if (!userData.intentText.trim()) return;
    transitionTo(2);
    
    const result = await extractThemes(userData.intentText, "struggles");
    if (result) {
      setUserData((prev) => ({
        ...prev,
        suggestedStruggles: result.suggested_tags,
        selectedStruggles: result.suggested_tags.map((t) => t.id),
      }));
      transitionTo(3);
    } else {
      toast.error("Something went wrong. Please try again.");
      transitionTo(1);
    }
  };

  const handleIntentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey && userData.intentText.trim()) {
      handleIntentSubmit();
    }
  };

  // Step 3: Goals → Step 4 (loading) → Step 5 (connection)
  const handleGoalsSubmit = async () => {
    if (!userData.goalsText.trim()) return;
    transitionTo(4);
    
    const result = await extractThemes(userData.goalsText, "goals");
    if (result) {
      setUserData((prev) => ({
        ...prev,
        suggestedGoals: result.suggested_tags,
        selectedGoals: result.suggested_tags.map((t) => t.id),
      }));
      transitionTo(5);
    } else {
      toast.error("Something went wrong. Please try again.");
      transitionTo(3);
    }
  };

  const handleGoalsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey && userData.goalsText.trim()) {
      handleGoalsSubmit();
    }
  };

  // Step 5: Connection → Step 6 (loading) → Step 7 (summary)
  const handleConnectionSubmit = async () => {
    if (!userData.connectionText.trim()) return;
    transitionTo(6);
    
    const result = await extractThemes(userData.connectionText, "connection_intent");
    if (result) {
      setUserData((prev) => ({
        ...prev,
        suggestedIntents: result.suggested_tags,
        selectedIntents: result.suggested_tags.map((t) => t.id),
      }));
      transitionTo(7);
    } else {
      toast.error("Something went wrong. Please try again.");
      transitionTo(5);
    }
  };

  const handleConnectionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey && userData.connectionText.trim()) {
      handleConnectionSubmit();
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

  // Step 7: Summary → Step 8 (email)
  const handleSummaryConfirm = () => {
    transitionTo(8);
  };

  // Step 8: Email → Step 9 (loading) → Step 10 (success)
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

  // Helper to get labels for selected tags
  const getSelectedLabels = (
    suggested: SuggestedTag[],
    selected: string[]
  ): string[] => {
    return suggested
      .filter((t) => selected.includes(t.id))
      .map((t) => t.label);
  };

  // Build the flowing summary sentence
  const buildSummarySentence = () => {
    const struggles = getSelectedLabels(userData.suggestedStruggles, userData.selectedStruggles);
    const goals = getSelectedLabels(userData.suggestedGoals, userData.selectedGoals);
    const intents = getSelectedLabels(userData.suggestedIntents, userData.selectedIntents);

    const formatList = (items: string[]) => {
      if (items.length === 0) return "";
      if (items.length === 1) return items[0].toLowerCase();
      if (items.length === 2) return `${items[0].toLowerCase()} and ${items[1].toLowerCase()}`;
      return `${items.slice(0, -1).map(i => i.toLowerCase()).join(", ")}, and ${items[items.length - 1].toLowerCase()}`;
    };

    const parts: string[] = [];
    
    if (struggles.length > 0) {
      parts.push(`You're carrying ${formatList(struggles)}`);
    }
    if (goals.length > 0) {
      parts.push(`reaching toward ${formatList(goals)}`);
    }
    if (intents.length > 0) {
      parts.push(`and looking for ${formatList(intents)}`);
    }

    return parts.join(", ") + ".";
  };

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
      <ThymosLogo />
      <OnboardingBackground />

      {/* Step 0: Name Input */}
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
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
              onKeyDown={handleNameKeyDown}
              className="ethereal-input bg-transparent border-none text-foreground text-2xl md:text-3xl font-serif text-center w-full focus:outline-none placeholder:text-foreground/40"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
              autoFocus
            />

            <p className="hint-fade-in text-foreground/50 text-sm">
              press enter ↵
            </p>
          </div>
        </div>
      )}

      {/* Step 1: What's on your heart */}
      {currentStep === 1 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-3xl md:text-4xl leading-relaxed mb-4 stagger-fade-in">
            What's been on your heart lately?
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-lg mb-8 font-serif"
            style={{ animationDelay: "0.2s" }}
          >
            Share as much or as little as you'd like
          </p>

          <textarea
            value={userData.intentText}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, intentText: e.target.value }))
            }
            onKeyDown={handleIntentKeyDown}
            placeholder="I've been feeling..."
            className="stagger-fade-in ethereal-input w-full min-h-[160px] bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-foreground text-lg font-serif placeholder:text-foreground/30 focus:outline-none focus:border-white/20 resize-none"
            style={{ 
              animationDelay: "0.3s",
              textShadow: "0 1px 8px rgba(0,0,0,0.1)" 
            }}
            autoFocus
          />

          {userData.intentText.trim() && (
            <button
              onClick={handleIntentSubmit}
              className="stagger-fade-in mt-6 text-foreground/70 font-serif text-lg hover:text-primary transition-all duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              Continue →
            </button>
          )}

          <p
            className="stagger-fade-in mt-4 text-foreground/40 text-sm"
            style={{ animationDelay: "0.5s" }}
          >
            ⌘ + enter to continue
          </p>
        </div>
      )}

      {/* Step 2: Loading - Processing intent */}
      {currentStep === 2 && (
        <div className={`relative z-10 ${isTransitioning ? "step-fade-out" : ""}`}>
          <LoadingState message="I hear you..." />
        </div>
      )}

      {/* Step 3: Goals Input */}
      {currentStep === 3 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-3xl md:text-4xl leading-relaxed mb-4 stagger-fade-in">
            What are you hoping to work on in yourself?
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-lg mb-8 font-serif"
            style={{ animationDelay: "0.2s" }}
          >
            There's no wrong answer here
          </p>

          <textarea
            value={userData.goalsText}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, goalsText: e.target.value }))
            }
            onKeyDown={handleGoalsKeyDown}
            placeholder="I'm trying to..."
            className="stagger-fade-in ethereal-input w-full min-h-[160px] bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-foreground text-lg font-serif placeholder:text-foreground/30 focus:outline-none focus:border-white/20 resize-none"
            style={{ 
              animationDelay: "0.3s",
              textShadow: "0 1px 8px rgba(0,0,0,0.1)" 
            }}
            autoFocus
          />

          {userData.goalsText.trim() && (
            <button
              onClick={handleGoalsSubmit}
              className="stagger-fade-in mt-6 text-foreground/70 font-serif text-lg hover:text-primary transition-all duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              Continue →
            </button>
          )}

          <p
            className="stagger-fade-in mt-4 text-foreground/40 text-sm"
            style={{ animationDelay: "0.5s" }}
          >
            ⌘ + enter to continue
          </p>
        </div>
      )}

      {/* Step 4: Loading - Processing goals */}
      {currentStep === 4 && (
        <div className={`relative z-10 ${isTransitioning ? "step-fade-out" : ""}`}>
          <LoadingState message="I see what you're reaching for..." />
        </div>
      )}

      {/* Step 5: Connection Intent Input */}
      {currentStep === 5 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-3xl md:text-4xl leading-relaxed mb-4 stagger-fade-in">
            What kind of connection are you hoping for here?
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-lg mb-8 font-serif"
            style={{ animationDelay: "0.2s" }}
          >
            This helps us find the right match for you
          </p>

          <textarea
            value={userData.connectionText}
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, connectionText: e.target.value }))
            }
            onKeyDown={handleConnectionKeyDown}
            placeholder="I'm looking for someone who..."
            className="stagger-fade-in ethereal-input w-full min-h-[160px] bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-foreground text-lg font-serif placeholder:text-foreground/30 focus:outline-none focus:border-white/20 resize-none"
            style={{ 
              animationDelay: "0.3s",
              textShadow: "0 1px 8px rgba(0,0,0,0.1)" 
            }}
            autoFocus
          />

          {userData.connectionText.trim() && (
            <button
              onClick={handleConnectionSubmit}
              className="stagger-fade-in mt-6 text-foreground/70 font-serif text-lg hover:text-primary transition-all duration-300"
              style={{ animationDelay: "0.4s" }}
            >
              Continue →
            </button>
          )}

          <p
            className="stagger-fade-in mt-4 text-foreground/40 text-sm"
            style={{ animationDelay: "0.5s" }}
          >
            ⌘ + enter to continue
          </p>
        </div>
      )}

      {/* Step 6: Loading - Processing connection */}
      {currentStep === 6 && (
        <div className={`relative z-10 ${isTransitioning ? "step-fade-out" : ""}`}>
          <LoadingState message="Finding what resonates..." />
        </div>
      )}

      {/* Step 7: Summary Confirmation */}
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

          <div
            className="flex flex-wrap justify-center gap-2 mb-8"
            style={{ animationDelay: "0.4s" }}
          >
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
            className="stagger-fade-in text-foreground font-serif text-lg hover:text-primary transition-all duration-300"
            style={{ animationDelay: "0.7s" }}
          >
            Yes, that's me →
          </button>
        </div>
      )}

      {/* Step 8: Email Input */}
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
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, email: e.target.value }))
              }
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
                className="stagger-fade-in text-foreground/70 font-serif text-lg hover:text-primary transition-all duration-300 disabled:opacity-50"
                style={{ animationDelay: "0.4s" }}
              >
                Continue →
              </button>
            )}

            <p
              className="stagger-fade-in text-foreground/40 text-sm"
              style={{ animationDelay: "0.5s" }}
            >
              press enter ↵
            </p>
          </div>
        </div>
      )}

      {/* Step 9: Loading - Creating account */}
      {currentStep === 9 && (
        <div className={`relative z-10 ${isTransitioning ? "step-fade-out" : ""}`}>
          <LoadingState message="Creating your space..." />
        </div>
      )}

      {/* Step 10: Success - Check your email */}
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
