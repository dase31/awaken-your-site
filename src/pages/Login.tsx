import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { SunIcon } from "@/components/icons/ThymosIcons";
import { CodeEntry } from "@/components/auth/CodeEntry";
import { authRedirectUrl } from "@/lib/platform";
import { toast } from "sonner";

type Step = "email" | "sent" | "error" | "rate_limited" | "password";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Password sign-in exists for App Review's demo account. Everyone else
  // signs in with an emailed code or link and never sets a password.
  const handlePasswordSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !password || loading) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password });
    setLoading(false);
    if (error) {
      toast.error("That email and password don't match.");
      return;
    }
    navigate("/auth/callback", { replace: true });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: authRedirectUrl(),
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

  // Back goes one step up: out of a sub-step to the email form, or home.
  const onBack = step === "email" ? () => navigate("/") : () => setStep("email");

  return (
    <OnboardingFrame onBack={onBack}>
      <div className="th-card-lg fade-in-up">
        {step === "email" && (
          <>
            <h1 className="th-h1 text-[1.7rem]">Welcome back.</h1>
            <p className="th-sub mb-6 mt-2">We'll send a link to your inbox.</p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Your email"
                aria-label="Your email"
                autoComplete="email"
                autoFocus
                className="th-field th-field-pill mb-4"
              />
              <button type="submit" className="th-btn" disabled={loading || !email.trim()}>
                {loading ? "Sending…" : "Send me a link →"}
              </button>
            </form>
            <button type="button" onClick={() => setStep("password")} className="th-text-link mt-6">
              Have a password? Sign in
            </button>
          </>
        )}

        {step === "sent" && (
          <>
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "#E3EAF1" }}
            >
              <SunIcon color="#C98F4A" width={28} height={28} />
            </div>
            <h1 className="th-h1 text-[1.7rem]">Check your inbox.</h1>
            <p className="th-sub mx-auto mt-2 max-w-xs">
              We sent a sign-in link to{" "}
              <span className="font-medium text-[color:var(--th-ink)]">{email}</span>. It expires in 60 minutes.
            </p>
            <CodeEntry email={email.trim()} tone="glass" />
          </>
        )}

        {step === "password" && (
          <>
            <h1 className="th-h1 mb-6 text-[1.7rem]">Sign in with a password</h1>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                aria-label="Email"
                autoComplete="username"
                className="th-field th-field-pill"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                autoComplete="current-password"
                className="th-field th-field-pill"
              />
              <button type="submit" className="th-btn mt-2" disabled={loading || !email.trim() || !password}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </>
        )}

        {step === "rate_limited" && (
          <>
            <h1 className="th-h1 text-[1.7rem]">Slow down a moment.</h1>
            <p className="th-sub mb-6 mt-2">Too many attempts. Wait a minute and try again.</p>
            <button type="button" className="th-btn" onClick={() => setStep("email")}>
              Try again
            </button>
          </>
        )}

        {step === "error" && (
          <>
            <h1 className="th-h1 text-[1.7rem]">No account found.</h1>
            <p className="th-sub mb-6 mt-2">That email isn't registered yet.</p>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                className="th-btn"
                onClick={() => {
                  setStep("email");
                  setEmail("");
                }}
              >
                Try a different email
              </button>
              <button type="button" className="th-text-link" onClick={() => navigate("/onboarding")}>
                Create an account instead →
              </button>
            </div>
          </>
        )}
      </div>
    </OnboardingFrame>
  );
};

export default Login;
