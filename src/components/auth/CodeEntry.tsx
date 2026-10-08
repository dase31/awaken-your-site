import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { authRedirectUrl } from "@/lib/platform";
import { toast } from "sonner";

const CODE_LENGTH = 6;

interface CodeEntryProps {
  email: string;
  // Called instead of the default "go to /auth/callback" when provided.
  onVerified?: () => void;
}

// Sign in with the 6-digit code from the same email as the magic link.
// This is the primary path inside the native app (a link would open Safari,
// not the app) and also fixes mail apps that "pre-open" links and burn them.
export function CodeEntry({ email, onVerified }: CodeEntryProps) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = async (value: string) => {
    if (verifying) return;
    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: value,
      type: "email",
    });
    setVerifying(false);

    if (error) {
      setCode("");
      toast.error("That code didn't work. Check it and try again.");
      inputRef.current?.focus();
      return;
    }

    if (onVerified) onVerified();
    else navigate("/auth/callback", { replace: true });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    if (digits.length === CODE_LENGTH) verify(digits);
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setCooldown(30);
    // shouldCreateUser:false — the account (if new) already exists by now.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: authRedirectUrl() },
    });
    if (error) toast.error("Couldn't resend the email. Try again in a minute.");
    else toast.success("New code sent.");
  };

  return (
    <div className="mt-8">
      <p className="text-white/50 text-sm mb-3">Or enter the 6-digit code from the email</p>
      <input
        ref={inputRef}
        value={code}
        onChange={handleChange}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="······"
        maxLength={CODE_LENGTH}
        disabled={verifying}
        aria-label="6-digit sign-in code"
        className="w-full max-w-[220px] mx-auto block bg-white/10 border border-white/25 rounded-2xl text-center text-white text-3xl tracking-[0.4em] py-3 pl-[0.4em] placeholder:text-white/25 focus:outline-none focus:border-white/60 transition-colors disabled:opacity-60"
      />
      <button
        type="button"
        onClick={resend}
        disabled={cooldown > 0}
        className="mt-4 text-white/45 text-xs hover:text-white/70 disabled:hover:text-white/45 transition-colors"
      >
        {cooldown > 0 ? `Resend email in ${cooldown}s` : "Resend email"}
      </button>
    </div>
  );
}
