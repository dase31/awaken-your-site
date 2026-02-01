import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PricingCard from "./PricingCard";

import cloud1 from "@/assets/cloud-1.png";
import cloud2 from "@/assets/cloud-2.png";
import cloud4 from "@/assets/cloud-4.png";
import bird1 from "@/assets/bird-1.png";
import bird2 from "@/assets/bird-2.png";
import bird3 from "@/assets/bird-3.png";
import phoneMockup from "@/assets/phone-mockup.png";

const HeroSection = () => {
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
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

      <div className="max-w-7xl mx-auto px-6">
        {/* Headline */}
        <h1 className="text-hero text-4xl md:text-5xl lg:text-6xl text-center max-w-4xl mx-auto leading-tight fade-in-up">
          A new operating system for your mind.
        </h1>

        {/* Main content grid */}
        <div className="mt-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Phone mockup */}
          <div className="relative fade-in-up" style={{ animationDelay: "0.2s" }}>
            <img
              src={phoneMockup}
              alt="Waking Up App"
              className="w-64 md:w-80 drop-shadow-2xl"
            />
          </div>

          {/* Pricing section */}
          <div className="w-full max-w-sm fade-in-up" style={{ animationDelay: "0.4s" }}>
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

export default HeroSection;
