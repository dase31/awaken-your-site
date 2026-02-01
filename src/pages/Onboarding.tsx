import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import cloud1 from "@/assets/cloud-1.png";
import cloud2 from "@/assets/cloud-2.png";
import cloud4 from "@/assets/cloud-4.png";
import bird1 from "@/assets/bird-1.png";
import bird2 from "@/assets/bird-2.png";

const Onboarding = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleContinue = () => {
    if (name.trim()) {
      // For now, just log - will expand to next steps later
      console.log("User name:", name);
      navigate("/");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleContinue();
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

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-md w-full fade-in-up">
        <h1 className="font-serif text-foreground text-3xl md:text-4xl lg:text-5xl leading-relaxed mb-12">
          What should we call you?
        </h1>

        <div className="space-y-6">
          <Input
            type="text"
            placeholder="Your first name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-card/90 backdrop-blur-sm border-0 text-card-foreground placeholder:text-card-foreground/50 h-14 rounded-2xl text-center text-lg shadow-lg focus:ring-2 focus:ring-primary/50"
            autoFocus
          />

          <Button
            onClick={handleContinue}
            disabled={!name.trim()}
            className="btn-gold w-full text-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
