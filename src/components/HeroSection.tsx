import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import cloud1 from "@/assets/cloud-1.png";
import cloud2 from "@/assets/cloud-2.png";
import cloud4 from "@/assets/cloud-4.png";
import bird1 from "@/assets/bird-1.png";
import bird2 from "@/assets/bird-2.png";
import bird3 from "@/assets/bird-3.png";

const HeroSection = () => {
  const navigate = useNavigate();

  const handleBeginJourney = () => {
    navigate("/onboarding");
  };

  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden flex items-center justify-center">
      {/* Floating clouds */}
      <img
        src={cloud1}
        alt=""
        className="absolute top-20 right-0 w-64 opacity-90 cloud-float pointer-events-none"
      />
      <img
        src={cloud2}
        alt=""
        className="absolute top-40 left-0 w-48 opacity-80 cloud-float-slow pointer-events-none"
      />
      <img
        src={cloud4}
        alt=""
        className="absolute bottom-32 left-20 w-32 opacity-70 cloud-float-fast pointer-events-none"
      />
      <img
        src={cloud4}
        alt=""
        className="absolute bottom-20 right-32 w-40 opacity-60 cloud-float pointer-events-none"
      />

      {/* Flying birds */}
      <img
        src={bird1}
        alt=""
        className="absolute top-32 left-[20%] w-8 bird-fly pointer-events-none"
      />
      <img
        src={bird2}
        alt=""
        className="absolute top-48 right-[25%] w-6 bird-fly pointer-events-none"
        style={{ animationDelay: "2s" }}
      />
      <img
        src={bird3}
        alt=""
        className="absolute top-64 left-[35%] w-5 bird-fly pointer-events-none"
        style={{ animationDelay: "4s" }}
      />

      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Headline */}
        <h1 className="text-hero text-4xl md:text-5xl lg:text-6xl leading-tight fade-in-up">
          It's time to actually re-connect.
        </h1>

        {/* Subtext */}
        <p className="text-foreground/80 text-lg md:text-xl mt-6 max-w-2xl mx-auto fade-in-up" style={{ animationDelay: "0.2s" }}>
          Find someone who truly understands. Share what weighs on you. Be the presence someone else needs.
        </p>

        {/* CTA Button */}
        <div className="mt-12 fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button
            onClick={handleBeginJourney}
            className="btn-gold text-xl px-12 py-6 h-auto"
          >
            Begin your journey
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
