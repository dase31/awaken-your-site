import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { BottomNav } from "@/components/navigation/BottomNav";
import ThymosLogo from "@/components/ThymosLogo";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
  /** "ambient" is the sky-and-glass look; screens move over one at a time. */
  variant?: "classic" | "ambient";
  /** Ambient only: show a back button on the left of the top row. */
  onBack?: () => void;
  /** Ambient only: replaces the settings button on the right of the top row. */
  actions?: ReactNode;
  /** Ambient only: fill the screen exactly and let the page scroll inside (chat). */
  fill?: boolean;
}

export function AppShell({ children, hideNav, variant = "classic", onBack, actions, fill }: AppShellProps) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/");
      else setChecking(false);
    });
  }, [navigate]);

  if (variant === "ambient") {
    return (
      <div className={fill ? "th-screen th-fill" : "th-screen"}>
        {!checking && (
          <>
            <div className="th-ambient" aria-hidden="true" />
            <div className="th-brand-mark">THYMOS</div>
            <div className="th-topbar">
              {onBack ? (
                <button className="th-icon-btn" onClick={onBack} aria-label="Back">
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <span />
              )}
              {actions ?? (
                <button className="th-icon-btn" onClick={() => navigate("/settings")} aria-label="Settings">
                  <Settings size={18} strokeWidth={1.7} />
                </button>
              )}
            </div>
            <main
              className={fill ? "relative z-10 px-4 flex-1 min-h-0 flex flex-col" : "relative z-10 px-4 min-h-[60vh]"}
              style={fill ? undefined : { paddingBottom: "calc(max(16px, env(safe-area-inset-bottom)) + 6rem)" }}
            >
              {children}
            </main>
            {!hideNav && <BottomNav ambient />}
          </>
        )}
      </div>
    );
  }

  if (checking) return (
    <div className="min-h-screen bg-sky-gradient" />
  );

  return (
    <div className="min-h-screen bg-sky-gradient relative overflow-hidden">
      <ThymosLogo showSettings />
      <OnboardingBackground />

      <main className="relative z-10 pt-[calc(env(safe-area-inset-top,0px)+5rem)] pb-32 px-4 min-h-screen">
        {children}
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
}
