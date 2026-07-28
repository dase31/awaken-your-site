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
        <h1 className="text-hero text-5xl md:text-6xl lg:text-7xl leading-[1.05] fade-in-up">
          It's time to actually re-connect.
        </h1>

        {/* CTA Button */}
        <div className="mt-14 flex flex-col items-center gap-5 fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button
            variant="ghost"
            onClick={handleBeginJourney}
            className="btn-gold h-auto"
          >
            Begin
          </Button>
          <button
            onClick={() => navigate("/login")}
            className="text-white/50 text-sm hover:text-white/80 transition-colors tracking-wide"
          >
            Sign in with your email
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
