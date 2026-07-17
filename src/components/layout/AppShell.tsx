import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { BottomNav } from "@/components/navigation/BottomNav";
import ThymosLogo from "@/components/ThymosLogo";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, hideNav }: AppShellProps) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // TODO: Re-enable auth guard before production
  useEffect(() => { setChecking(false); }, []);

  return (
    <div className="min-h-screen bg-sky-gradient relative overflow-hidden">
      <ThymosLogo />
      <OnboardingBackground />

      <main className="relative z-10 pt-20 pb-24 px-4 min-h-screen">
        {children}
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
}
