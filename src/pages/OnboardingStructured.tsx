import { useState } from "react";
import { useNavigate } from "react-router-dom";

import cloud1 from "@/assets/cloud-1.png";
import cloud2 from "@/assets/cloud-2.png";
import cloud4 from "@/assets/cloud-4.png";
import bird1 from "@/assets/bird-1.png";
import bird2 from "@/assets/bird-2.png";

const intentOptions = [
  { id: "heard", label: "To be heard" },
  { id: "support", label: "To support others" },
  { id: "purpose", label: "To find purpose" },
  { id: "connect", label: "To connect" },
  { id: "unsure", label: "I'm not sure yet" },
];

const struggleOptions = [
  { id: "anxiety", label: "Anxiety or worry" },
  { id: "loneliness", label: "Loneliness" },
  { id: "grief", label: "Loss or grief" },
  { id: "direction", label: "Finding direction" },
  { id: "unheard", label: "Feeling unheard" },
  { id: "doubt", label: "Self-doubt" },
];

const strengthOptions = [
  { id: "listener", label: "I listen deeply" },
  { id: "calm", label: "I stay calm in storms" },
  { id: "experienced", label: "I've walked through darkness" },
  { id: "questions", label: "I ask good questions" },
  { id: "space", label: "I hold space without judgment" },
  { id: "share", label: "I share from experience" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    intent: "",
    struggles: [] as string[],
    strengths: [] as string[],
  });

  const handleNameContinue = () => {
    if (userData.name.trim()) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userData.name.trim()) {
      handleNameContinue();
    }
  };

  const handleIntentSelect = (intentId: string) => {
    setUserData((prev) => ({ ...prev, intent: intentId }));
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(2);
      setIsTransitioning(false);
    }, 300);
  };

  const toggleStruggle = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      struggles: prev.struggles.includes(id)
        ? prev.struggles.filter((s) => s !== id)
        : [...prev.struggles, id],
    }));
  };

  const toggleStrength = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      strengths: prev.strengths.includes(id)
        ? prev.strengths.filter((s) => s !== id)
        : [...prev.strengths, id],
    }));
  };

  const handleStrugglesNext = () => {
    if (userData.struggles.length > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(3);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleStrengthsNext = () => {
    if (userData.strengths.length > 0) {
      console.log("User data:", userData);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
      {/* Floating clouds */}
      <img
        src={cloud1}
        alt=""
        className="absolute top-16 right-10 w-48 opacity-70 cloud-float pointer-events-none"
      />
      <img
        src={cloud2}
        alt=""
        className="absolute top-32 left-10 w-40 opacity-60 cloud-float-slow pointer-events-none"
      />
      <img
        src={cloud4}
        alt=""
        className="absolute bottom-24 left-16 w-32 opacity-50 cloud-float-fast pointer-events-none"
      />
      <img
        src={cloud4}
        alt=""
        className="absolute bottom-32 right-20 w-36 opacity-40 cloud-float pointer-events-none"
      />

      {/* Flying birds */}
      <img
        src={bird1}
        alt=""
        className="absolute top-24 left-[25%] w-6 bird-fly pointer-events-none opacity-70"
      />
      <img
        src={bird2}
        alt=""
        className="absolute top-40 right-[30%] w-5 bird-fly pointer-events-none opacity-60"
        style={{ animationDelay: "3s" }}
      />

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
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
              autoFocus
            />

            <p className="hint-fade-in text-foreground/50 text-sm">
              press enter ↵
            </p>
          </div>
        </div>
      )}

      {/* Step 1: What brings you here */}
      {currentStep === 1 && (
        <div
          className={`relative z-10 text-center px-6 max-w-md w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-3xl md:text-4xl lg:text-5xl leading-relaxed mb-10 stagger-fade-in">
            What brings you to Thymos?
          </h1>

          <div className="space-y-6">
            {intentOptions.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleIntentSelect(option.id)}
                className="stagger-fade-in block w-full text-foreground font-serif text-xl md:text-2xl py-4 px-8 rounded-full border border-white/10 hover:border-white/30 transition-all duration-300 hover:text-primary hover:scale-[1.02] focus:outline-none focus:text-primary"
                style={{ 
                  animationDelay: `${0.3 + index * 0.15}s`,
                  textShadow: '0 2px 10px rgba(0,0,0,0.15)'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Struggles */}
      {currentStep === 2 && (
        <div
          className={`relative z-10 text-center px-6 max-w-md w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-3xl md:text-4xl lg:text-5xl leading-relaxed mb-10 stagger-fade-in">
            What weighs on you?
          </h1>

          <div className="space-y-4">
            {struggleOptions.map((option, index) => {
              const isSelected = userData.struggles.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleStruggle(option.id)}
                  className={`stagger-fade-in block w-full text-foreground font-serif text-xl md:text-2xl py-4 px-8 rounded-full border transition-all duration-300 hover:scale-[1.02] focus:outline-none ${
                    isSelected
                      ? "bg-white/10 border-white/40 text-primary"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  style={{
                    animationDelay: `${0.3 + index * 0.1}s`,
                    textShadow: '0 2px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {userData.struggles.length > 0 && (
            <button
              onClick={handleStrugglesNext}
              className="stagger-fade-in mt-8 text-foreground/70 font-serif text-lg hover:text-primary transition-all duration-300"
              style={{ animationDelay: "0.8s" }}
            >
              Continue →
            </button>
          )}
        </div>
      )}

      {/* Step 3: Strengths */}
      {currentStep === 3 && (
        <div
          className={`relative z-10 text-center px-6 max-w-md w-full ${
            isTransitioning ? "step-fade-out" : "fade-in-up"
          }`}
        >
          <h1 className="font-serif text-foreground text-3xl md:text-4xl lg:text-5xl leading-relaxed mb-10 stagger-fade-in">
            What do you bring?
          </h1>

          <div className="space-y-4">
            {strengthOptions.map((option, index) => {
              const isSelected = userData.strengths.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleStrength(option.id)}
                  className={`stagger-fade-in block w-full text-foreground font-serif text-xl md:text-2xl py-4 px-8 rounded-full border transition-all duration-300 hover:scale-[1.02] focus:outline-none ${
                    isSelected
                      ? "bg-white/10 border-white/40 text-primary"
                      : "border-white/10 hover:border-white/30"
                  }`}
                  style={{
                    animationDelay: `${0.3 + index * 0.1}s`,
                    textShadow: '0 2px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {userData.strengths.length > 0 && (
            <button
              onClick={handleStrengthsNext}
              className="stagger-fade-in mt-8 text-foreground/70 font-serif text-lg hover:text-primary transition-all duration-300"
              style={{ animationDelay: "0.8s" }}
            >
              Continue →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Onboarding;
