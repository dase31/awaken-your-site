import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import ThymosLogo from "@/components/ThymosLogo";

type Step = "email" | "sent" | "error" | "rate_limited";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Sign-in only — an unregistered email must not silently create
        // an account, it should be told to sign up instead.
        shouldCreateUser: false,
      },
    });

    setLoading(false);

    if (error) {
      if (error.status === 429) setStep("rate_limited");
      else setStep("error");
    } else {
      setStep("sent");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
      <ThymosLogo />
      <OnboardingBackground />

      <div className="relative z-10 w-full max-w-sm px-8 text-center fade-in-up">

        {step === "email" && (
          <>
            <h1
              className="font-serif text-white text-3xl md:text-4xl mb-2"
              style={{ textShadow: "0 2px 16px rgba(0,60,120,0.2)" }}
            >
              Welcome back.
            </h1>
            <p className="text-white/50 text-sm mb-12">
              We'll send a link to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Your email"
                autoFocus
                className="w-full bg-transparent border-b border-white/30 text-white text-xl text-center placeholder:text-white/30 py-3 focus:outline-none focus:border-white/70 transition-colors ethereal-input caret-white"
              />
              <p className="hint-fade-in text-white/40 text-xs pt-1">press enter ↵</p>
            </form>
          </>
        )}

        {step === "sent" && (
          <div className="fade-in-up">
            <p className="text-white/40 text-4xl mb-6">✦</p>
            <h1
              className="font-serif text-white text-3xl mb-3"
              style={{ textShadow: "0 2px 16px rgba(0,60,120,0.2)" }}
            >
              Check your inbox.
            </h1>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs mx-auto">
              We sent a sign-in link to <span className="text-white/80">{email}</span>.
              It expires in 60 minutes.
            </p>
          </div>
        )}

        {step === "rate_limited" && (
          <div className="fade-in-up">
            <h1 className="font-serif text-white text-3xl mb-3" style={{ textShadow: "0 2px 16px rgba(0,60,120,0.2)" }}>
              Slow down a moment.
            </h1>
            <p className="text-white/55 text-sm mb-8 leading-relaxed">
              Too many attempts. Wait a minute and try again.
            </p>
            <button
              onClick={() => setStep("email")}
              className="text-white/70 text-sm hover:text-white transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="fade-in-up">
            <h1
              className="font-serif text-white text-3xl mb-3"
              style={{ textShadow: "0 2px 16px rgba(0,60,120,0.2)" }}
            >
              No account found.
            </h1>
            <p className="text-white/55 text-sm mb-8">
              That email isn't registered yet.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setStep("email"); setEmail(""); }}
                className="text-white/70 text-sm hover:text-white transition-colors"
              >
                Try a different email
              </button>
              <button
                onClick={() => navigate("/onboarding")}
                className="text-white/50 text-sm hover:text-white/70 transition-colors"
              >
                Create an account instead →
              </button>
            </div>
          </div>
        )}

        {step === "email" && (
          <button
            onClick={() => navigate("/")}
            className="mt-12 text-white/30 text-xs hover:text-white/50 transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
};

export default Login;
