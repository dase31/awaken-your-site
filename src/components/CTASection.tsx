import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PricingCard from "./PricingCard";

import waves from "@/assets/waves.png";
import hippo from "@/assets/hippo.png";
import bird3 from "@/assets/bird-3.png";

const CTASection = () => {
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

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

      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 className="text-hero text-4xl md:text-5xl lg:text-6xl text-center max-w-4xl mx-auto leading-tight">
          A new operating system for your mind.
        </h2>

        <div className="mt-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Pricing section */}
          <div className="w-full max-w-sm">
            <div className="space-y-4">
              <PricingCard
                trialDays={14}
                plan="Annual"
                price="$129.99"
                period="year"
                selected={selectedPlan === "annual"}
                bestValue
                onSelect={() => setSelectedPlan("annual")}
              />
              <PricingCard
                trialDays={7}
                plan="Monthly"
                price="$19.99"
                period="month"
                selected={selectedPlan === "monthly"}
                onSelect={() => setSelectedPlan("monthly")}
              />
            </div>

            <p className="text-foreground/80 text-sm mt-4 leading-relaxed">
              After your free trial ends, you will be charged $129.99 and your
              subscription will automatically renew each year. Cancel anytime.
            </p>

            {!showEmailForm ? (
              <Button
                onClick={() => setShowEmailForm(true)}
                className="btn-gold w-full mt-6 text-lg"
              >
                Try for free
              </Button>
            ) : (
              <div className="mt-6 space-y-3">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-card border-0 text-card-foreground placeholder:text-card-foreground/50 h-12 rounded-xl"
                />
                <Button className="btn-gold w-full text-lg">
                  Next
                </Button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-foreground/20">
              <p className="text-foreground/90 text-sm">
                Waking Up is free for anyone who can't afford it.{" "}
                <a href="#" className="underline hover:no-underline">
                  Request a scholarship.
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
