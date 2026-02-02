import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { ThemeTag } from "@/components/onboarding/ThemeTag";
import { LoadingState } from "@/components/onboarding/LoadingState";
import { useExtractThemes } from "@/hooks/useExtractThemes";
import { toast } from "sonner";

interface SuggestedTag {
  id: string;
  label: string;
  confidence: number;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { extractThemes, isLoading } = useExtractThemes();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [userData, setUserData] = useState({
    name: "",
    intentText: "",
    goalsText: "",
    connectionText: "",
    suggestedStruggles: [] as SuggestedTag[],
    selectedStruggles: [] as string[],
    suggestedGoals: [] as SuggestedTag[],
    selectedGoals: [] as string[],
    suggestedIntents: [] as SuggestedTag[],
    selectedIntents: [] as string[],
    intentContext: "",
    goalsContext: "",
    connectionContext: "",
  });

  const transitionTo = (step: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 300);
  };

  const handleNameContinue = () => {
    if (userData.name.trim()) {
      transitionTo(1);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userData.name.trim()) {
      handleNameContinue();
    }
  };

  const handleIntentSubmit = async () => {
    if (!userData.intentText.trim()) return;
    
    transitionTo(2); // Show loading state
    
    const result = await extractThemes(userData.intentText, "struggles");
    
    if (result) {
      setUserData((prev) => ({
        ...prev,
        suggestedStruggles: result.suggested_tags,
        selectedStruggles: result.suggested_tags.map((t) => t.id),
        intentContext: result.context,
      }));
      transitionTo(3); // Theme confirmation
    } else {
      toast.error("Something went wrong. Please try again.");
      transitionTo(1); // Back to input
    }
  };

  const handleIntentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey && userData.intentText.trim()) {
      handleIntentSubmit();
    }
  };

  const toggleStruggle = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      selectedStruggles: prev.selectedStruggles.includes(id)
        ? prev.selectedStruggles.filter((s) => s !== id)
        : [...prev.selectedStruggles, id],
    }));
  };

  const handleStrugglesConfirm = () => {
    transitionTo(4); // Goals input
  };

  const handleGoalsSubmit = async () => {
    if (!userData.goalsText.trim()) return;
    
    transitionTo(5); // Show loading state
    
    const result = await extractThemes(userData.goalsText, "goals");
    
    if (result) {
      setUserData((prev) => ({
        ...prev,
        suggestedGoals: result.suggested_tags,
        selectedGoals: result.suggested_tags.map((t) => t.id),
        goalsContext: result.context,
      }));
      transitionTo(6); // Goals confirmation
    } else {
      toast.error("Something went wrong. Please try again.");
      transitionTo(4); // Back to input
    }
  };

  const handleGoalsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey && userData.goalsText.trim()) {
      handleGoalsSubmit();
    }
  };

  const toggleGoal = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(id)
        ? prev.selectedGoals.filter((g) => g !== id)
        : [...prev.selectedGoals, id],
    }));
  };

  const handleGoalsConfirm = () => {
    transitionTo(7); // Connection intent input
  };

  const handleConnectionSubmit = async () => {
    if (!userData.connectionText.trim()) return;
    
    transitionTo(8); // Show loading state
    
    const result = await extractThemes(userData.connectionText, "connection_intent");
    
    if (result) {
      setUserData((prev) => ({
        ...prev,
        suggestedIntents: result.suggested_tags,
        selectedIntents: result.suggested_tags.map((t) => t.id),
        connectionContext: result.context,
      }));
      transitionTo(9); // Connection confirmation
    } else {
      toast.error("Something went wrong. Please try again.");
      transitionTo(7); // Back to input
    }
  };

  const handleConnectionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey && userData.connectionText.trim()) {
      handleConnectionSubmit();
    }
  };

  const toggleIntent = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      selectedIntents: prev.selectedIntents.includes(id)
        ? prev.selectedIntents.filter((i) => i !== id)
        : [...prev.selectedIntents, id],
    }));
  };

  const handleConnectionConfirm = () => {
    console.log("Final user data:", userData);
    navigate("/");
  };

  const handleAddMore = (returnStep: number) => {
    transitionTo(returnStep);
  };

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
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

      {/* Step 1: What's on your heart - Free text */}
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
        <div
          className={`relative z-10 ${
            isTransitioning ? "step-fade-out" : ""
          }`}
        >
          <LoadingState message="I hear you..." />
        </div>
      )}

      {/* Step 3: Theme Confirmation - Struggles */}
      {currentStep === 3 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-2xl md:text-3xl leading-relaxed mb-2 stagger-fade-in">
            It sounds like you're carrying...
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-base mb-8 font-serif"
            style={{ animationDelay: "0.2s" }}
          >
            Tap to adjust what resonates
          </p>

          <div
            className="flex flex-wrap justify-center gap-3 mb-8"
            style={{ animationDelay: "0.3s" }}
          >
            {userData.suggestedStruggles.map((tag, index) => (
              <ThemeTag
                key={tag.id}
                label={tag.label}
                isSelected={userData.selectedStruggles.includes(tag.id)}
                onClick={() => toggleStruggle(tag.id)}
                animationDelay={0.3 + index * 0.1}
              />
            ))}
          </div>

          <div
            className="stagger-fade-in flex flex-col items-center gap-3"
            style={{ animationDelay: "0.6s" }}
          >
            <button
              onClick={handleStrugglesConfirm}
              className="text-foreground font-serif text-lg hover:text-primary transition-all duration-300"
            >
              Yes, continue →
            </button>
            <button
              onClick={() => handleAddMore(1)}
              className="text-foreground/50 font-serif text-sm hover:text-foreground/70 transition-all duration-300"
            >
              Let me add more
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Goals Input */}
      {currentStep === 4 && (
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

      {/* Step 5: Loading - Processing goals */}
      {currentStep === 5 && (
        <div
          className={`relative z-10 ${
            isTransitioning ? "step-fade-out" : ""
          }`}
        >
          <LoadingState message="I see what you're reaching for..." />
        </div>
      )}

      {/* Step 6: Goals Confirmation */}
      {currentStep === 6 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-2xl md:text-3xl leading-relaxed mb-2 stagger-fade-in">
            You're reaching toward...
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-base mb-8 font-serif"
            style={{ animationDelay: "0.2s" }}
          >
            Tap to adjust what feels right
          </p>

          <div
            className="flex flex-wrap justify-center gap-3 mb-8"
            style={{ animationDelay: "0.3s" }}
          >
            {userData.suggestedGoals.map((tag, index) => (
              <ThemeTag
                key={tag.id}
                label={tag.label}
                isSelected={userData.selectedGoals.includes(tag.id)}
                onClick={() => toggleGoal(tag.id)}
                animationDelay={0.3 + index * 0.1}
              />
            ))}
          </div>

          <div
            className="stagger-fade-in flex flex-col items-center gap-3"
            style={{ animationDelay: "0.6s" }}
          >
            <button
              onClick={handleGoalsConfirm}
              className="text-foreground font-serif text-lg hover:text-primary transition-all duration-300"
            >
              Yes, continue →
            </button>
            <button
              onClick={() => handleAddMore(4)}
              className="text-foreground/50 font-serif text-sm hover:text-foreground/70 transition-all duration-300"
            >
              Let me add more
            </button>
          </div>
        </div>
      )}

      {/* Step 7: Connection Intent Input */}
      {currentStep === 7 && (
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

      {/* Step 8: Loading - Processing connection intent */}
      {currentStep === 8 && (
        <div
          className={`relative z-10 ${
            isTransitioning ? "step-fade-out" : ""
          }`}
        >
          <LoadingState message="Finding what resonates..." />
        </div>
      )}

      {/* Step 9: Connection Confirmation */}
      {currentStep === 9 && (
        <div
          className={`relative z-10 text-center px-6 max-w-lg w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-2xl md:text-3xl leading-relaxed mb-2 stagger-fade-in">
            You're looking for...
          </h1>
          <p
            className="stagger-fade-in text-foreground/60 text-base mb-8 font-serif"
            style={{ animationDelay: "0.2s" }}
          >
            Tap to adjust what feels right
          </p>

          <div
            className="flex flex-wrap justify-center gap-3 mb-8"
            style={{ animationDelay: "0.3s" }}
          >
            {userData.suggestedIntents.map((tag, index) => (
              <ThemeTag
                key={tag.id}
                label={tag.label}
                isSelected={userData.selectedIntents.includes(tag.id)}
                onClick={() => toggleIntent(tag.id)}
                animationDelay={0.3 + index * 0.1}
              />
            ))}
          </div>

          <div
            className="stagger-fade-in flex flex-col items-center gap-3"
            style={{ animationDelay: "0.6s" }}
          >
            <button
              onClick={handleConnectionConfirm}
              className="text-foreground font-serif text-lg hover:text-primary transition-all duration-300"
            >
              That's what I need →
            </button>
            <button
              onClick={() => handleAddMore(7)}
              className="text-foreground/50 font-serif text-sm hover:text-foreground/70 transition-all duration-300"
            >
              Let me add more
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
