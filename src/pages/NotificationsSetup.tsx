import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingFrame } from "@/components/onboarding/OnboardingFrame";
import { RippleIcon } from "@/components/icons/ThymosIcons";
import { useUserSettings } from "@/hooks/useUserSettings";
import { acceptNotifications, declineNotifications, pushAvailable } from "@/lib/push";

// Only ever continue to a known in-app destination.
const ALLOWED_NEXT = new Set(["/home", "/match", "/telos"]);
const safeNext = (value: string | null) => (value && ALLOWED_NEXT.has(value) ? value : "/home");

// Asked once, right after choosing a username and before the first match:
// the moment someone has a reason to want to hear back. Saying yes here is
// the explicit opt-in for both app notifications and email; saying no is
// remembered so it isn't asked again (it stays one switch away in Settings).
const NotificationsSetup = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const { settings, loading, update } = useUserSettings();
  const [busy, setBusy] = useState(false);
  const native = pushAvailable();

  const goOn = () => navigate(`/safety-check?next=${next}`, { replace: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/", { replace: true });
    });
  }, [navigate]);

  // Already answered (an existing account, or they came back to this page).
  useEffect(() => {
    if (!loading && settings.notificationsDecidedAt) goOn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, settings.notificationsDecidedAt]);

  const accept = async () => {
    if (busy) return;
    setBusy(true);
    const { denied, saved } = await acceptNotifications(update);
    setBusy(false);
    if (denied) toast.info("Notifications are off for Thymos on this phone. You can change that in iOS Settings.");
    if (!saved) toast.error("Couldn't save that. You can set it later in Settings.");
    goOn();
  };

  const decline = async () => {
    if (busy) return;
    setBusy(true);
    await declineNotifications(update);
    setBusy(false);
    goOn();
  };

  return (
    <OnboardingFrame hideChrome>
      <div className="th-card-lg fade-in-up">
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "#E2E9F1" }}
        >
          <RippleIcon width={30} height={30} />
        </div>
        <h1 className="th-h1 text-[1.7rem]">Know when someone reaches out.</h1>
        <p className="th-sub mx-auto mb-2 mt-3 max-w-[19rem]">
          We'll tell you when someone wants to connect, accepts your request, or sends you a message{native ? " — on your phone, and by email" : " — by email"}.
        </p>
        <p className="mx-auto mb-6 max-w-[19rem] text-[0.8rem] leading-relaxed text-[color:var(--th-text-3)]">
          Never what was said, only that something happened. You can change this any time in Settings.
        </p>

        <div className="flex flex-col items-center gap-3">
          <button type="button" className="th-btn" onClick={accept} disabled={busy || loading}>
            {busy ? "One moment…" : "Turn on notifications"}
          </button>
          <button type="button" className="th-text-link" onClick={decline} disabled={busy || loading}>
            Not now
          </button>
        </div>
      </div>
    </OnboardingFrame>
  );
};

export default NotificationsSetup;
