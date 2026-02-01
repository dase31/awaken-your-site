import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import waves from "@/assets/waves.png";
import hippo from "@/assets/hippo.png";
import bird3 from "@/assets/bird-3.png";

const CTASection = () => {
  const navigate = useNavigate();

  const handleBeginJourney = () => {
    navigate("/onboarding");
  };

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Waves background */}
      <img
        src={waves}
        alt=""
        className="absolute bottom-0 left-0 right-0 w-full opacity-40 pointer-events-none"
      />

      {/* Hippo */}
      <img
        src={hippo}
        alt=""
        className="absolute bottom-0 right-[10%] w-48 md:w-64 pointer-events-none"
      />

      {/* Bird */}
      <img
        src={bird3}
        alt=""
        className="absolute top-20 left-[15%] w-8 bird-fly pointer-events-none"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-hero text-4xl md:text-5xl lg:text-6xl leading-tight">
          It's time to actually re-connect.
        </h2>

        <p className="text-foreground/80 text-lg md:text-xl mt-6 max-w-2xl mx-auto">
          You don't have to carry it alone.
        </p>

        <div className="mt-12">
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

export default CTASection;
