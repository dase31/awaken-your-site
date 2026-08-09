import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import ThymosLogo from "@/components/ThymosLogo";

// ── Constraints ────────────────────────────────────────────────
const MIN = 3;
const MAX = 20;
const VALID_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*[a-zA-Z0-9]$|^[a-zA-Z]{1,2}$/;
const NO_CONSEC_UNDERSCORES = /__/;

const RESERVED = new Set([
  "admin", "administrator", "thymos", "support", "help", "mod", "moderator",
  "staff", "official", "team", "system", "bot", "null", "undefined",
  "root", "superuser", "owner", "founder", "ceo", "dev", "developer",
  "security", "abuse", "contact", "info", "noreply", "no_reply",
  "anonymous", "anon", "guest", "user", "test", "demo",
]);

// Basic profanity list — extend as needed
const PROFANITY = new Set([
  "fuck", "shit", "ass", "bitch", "cunt", "dick", "cock", "pussy",
  "nigger", "nigga", "faggot", "retard", "slut", "whore",
]);

// ── Validation ─────────────────────────────────────────────────
type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

function validateFormat(value: string): ValidationResult {
  if (value.length < MIN) return { ok: false, message: `At least ${MIN} characters` };
  if (value.length > MAX) return { ok: false, message: `No more than ${MAX} characters` };
  if (!/^[a-zA-Z]/.test(value)) return { ok: false, message: "Must start with a letter" };
  if (/[^a-zA-Z0-9_]/.test(value)) return { ok: false, message: "Letters, numbers and _ only" };
  if (NO_CONSEC_UNDERSCORES.test(value)) return { ok: false, message: "No consecutive underscores" };
  if (value.endsWith("_")) return { ok: false, message: "Cannot end with an underscore" };
  if (RESERVED.has(value.toLowerCase())) return { ok: false, message: "That username is reserved" };
  for (const word of PROFANITY) {
    if (value.toLowerCase().includes(word)) return { ok: false, message: "Username not allowed" };
  }
  return { ok: true };
}

// ── Component ──────────────────────────────────────────────────
type Status = "idle" | "checking" | "available" | "taken" | "invalid";

const UsernameSetup = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/");
    });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, ""); // strip spaces immediately
    setValue(raw);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!raw) { setStatus("idle"); setMessage(""); return; }

    const fmt = validateFormat(raw);
    if (!fmt.ok) {
      setStatus("invalid");
      setMessage(fmt.message);
      return;
    }

    // Format is fine — check availability after 450ms pause
    setStatus("checking");
    setMessage("");
    debounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", raw.toLowerCase())
        .maybeSingle();

      if (error) { setStatus("idle"); return; }
      if (data) {
        setStatus("taken");
        setMessage("Already taken");
      } else {
        setStatus("available");
        setMessage("Available");
      }
    }, 450);
  };

  const handleSubmit = async () => {
    if (status !== "available" || saving) return;
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/"); return; }

    const { error } = await supabase
      .from("profiles")
      .update({ username: value.toLowerCase() })
      .eq("id", session.user.id);

    setSaving(false);

    if (error) {
      // Likely a race — someone grabbed it just now
      setStatus("taken");
      setMessage("Just taken — try another");
      return;
    }

    navigate(session.user.user_metadata?.telos_first ? "/telos" : "/match");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  // Status indicator colour
  const indicatorColor =
    status === "available" ? "text-emerald-300" :
    status === "taken"     ? "text-red-300" :
    status === "invalid"   ? "text-amber-300" :
    status === "checking"  ? "text-white/40" :
    "transparent";

  return (
    <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
      <ThymosLogo />
      <OnboardingBackground />

      <div className="relative z-10 w-full max-w-sm px-8 text-center fade-in-up">
        <h1
          className="font-serif text-white text-3xl md:text-4xl mb-2"
          style={{ textShadow: "0 2px 16px rgba(0,60,120,0.2)" }}
        >
          Choose a username.
        </h1>
        <p className="text-white/50 text-sm mb-12 leading-relaxed">
          This is how others will find you.<br />
          3–20 characters · letters, numbers, _
        </p>

        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30 text-xl select-none">@</span>
            <input
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={MAX}
              placeholder="yourname"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-transparent border-b border-white/30 text-white text-xl text-center pl-5 placeholder:text-white/25 py-3 focus:outline-none focus:border-white/70 transition-colors caret-white"
            />
          </div>

          {/* Inline feedback */}
          <div className={`text-sm h-5 transition-all duration-200 ${indicatorColor}`}>
            {status === "checking" ? "Checking…" : message}
          </div>

          <p className="hint-fade-in text-white/35 text-xs pt-1">press enter ↵</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={status !== "available" || saving}
          className={`mt-10 w-full py-3.5 rounded-full font-semibold text-base transition-all duration-300 ${
            status === "available"
              ? "bg-white/20 backdrop-blur-sm border border-white/40 text-white hover:bg-white/30 active:scale-[0.98]"
              : "bg-white/8 border border-white/10 text-white/25 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving…" : "Confirm username"}
        </button>
      </div>
    </div>
  );
};

export default UsernameSetup;
