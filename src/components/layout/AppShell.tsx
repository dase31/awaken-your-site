import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/navigation/BottomNav";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
  /** Show a back button on the left of the top row. */
  onBack?: () => void;
  /** Replaces the settings button on the right of the top row. */
  actions?: ReactNode;
  /** Fill the screen exactly and let the page scroll inside (chat). */
  fill?: boolean;
}

// Every signed-in screen: the fixed ambient sky, the centred wordmark on its
// own row, a back/actions row beneath it, then the page and the glass tab bar.
export function AppShell({ children, hideNav, onBack, actions, fill }: AppShellProps) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/");
      else setChecking(false);
    });
  }, [navigate]);

  return (
    <div className={fill ? "th-screen th-fill" : "th-screen"}>
      {!checking && (
        <>
          <div className="th-ambient" aria-hidden="true" />
          <div className="th-brand-mark">THYMOS</div>
          <div className="th-topbar">
            {onBack ? (
              <button type="button" className="th-icon-btn" onClick={onBack} aria-label="Back">
                <ChevronLeft size={20} />
              </button>
            ) : (
              <span />
            )}
            {actions ?? (
              <button type="button" className="th-icon-btn" onClick={() => navigate("/settings")} aria-label="Settings">
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
          {!hideNav && <BottomNav />}
        </>
      )}
    </div>
  );
}
