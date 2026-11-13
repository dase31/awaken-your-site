import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";

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
    if (fmt.ok === false) {
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

    const next = session.user.user_metadata?.telos_first ? "/telos" : "/match";
    // Notification choice first, then the private safety question.
    navigate(`/notifications-setup?next=${next}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  // Status indicator colour
  const indicatorColor =
    status === "available" ? "text-[color:var(--th-sage-deep)]" :
    status === "taken"     ? "text-[#9b4a3c]" :
    status === "invalid"   ? "text-[color:var(--th-umber-light)]" :
    "text-[color:var(--th-text-3)]";

  return (
    <OnboardingFrame hideChrome>
      <div className="th-card-lg fade-in-up">
        <h1 className="th-h1 text-[1.7rem]">Choose a username.</h1>
        <p className="th-sub mb-6 mt-2 leading-relaxed">
          This is how others will find you.
          <br />
          3–20 characters · letters, numbers, _
        </p>

        <div className="relative">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 select-none text-lg text-[color:var(--th-text-3)]">@</span>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX}
            placeholder="yourname"
            aria-label="Username"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="th-field th-field-pill pl-9"
            style={{ fontStyle: "normal" }}
          />
        </div>

        {/* Inline feedback */}
        <div className={`mb-5 mt-3 h-5 text-sm transition-colors duration-200 ${indicatorColor}`} aria-live="polite">
          {status === "checking" ? "Checking…" : message}
        </div>

        <button type="button" className="th-btn" onClick={handleSubmit} disabled={status !== "available" || saving}>
          {saving ? "Saving…" : "Confirm username"}
        </button>
      </div>
    </OnboardingFrame>
  );
};

export default UsernameSetup;
