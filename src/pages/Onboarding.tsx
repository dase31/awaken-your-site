import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    intent: "",
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
    // For now, navigate home after selection
    setTimeout(() => {
      console.log("User data:", { ...userData, intent: intentId });
      navigate("/");
    }, 400);
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
          <h1 className="font-serif text-foreground text-3xl md:text-4xl lg:text-5xl leading-relaxed mb-12">
            What should we call you?
          </h1>

          <div className="space-y-6">
            <Input
              type="text"
              placeholder="Your first name"
              value={userData.name}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
              onKeyDown={handleNameKeyDown}
              className="bg-card/90 backdrop-blur-sm border-0 text-card-foreground placeholder:text-card-foreground/50 h-14 rounded-2xl text-center text-lg shadow-lg focus:ring-2 focus:ring-primary/50"
              autoFocus
            />

            <Button
              onClick={handleNameContinue}
              disabled={!userData.name.trim()}
              className="btn-gold w-full text-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: What brings you here */}
      {currentStep === 1 && (
        <div className="relative z-10 text-center px-6 max-w-md w-full">
          <h1 className="font-serif text-foreground text-3xl md:text-4xl lg:text-5xl leading-relaxed mb-10 stagger-fade-in">
            What brings you to Thymos?
          </h1>

          <div className="space-y-4">
            {intentOptions.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleIntentSelect(option.id)}
                className="stagger-fade-in w-full bg-card/90 backdrop-blur-sm text-card-foreground py-4 px-8 rounded-full text-lg font-medium shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-primary hover:shadow-xl border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ animationDelay: `${0.3 + index * 0.2}s` }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
