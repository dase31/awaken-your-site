import { ReactNode } from "react";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { BottomNav } from "@/components/navigation/BottomNav";
import ThymosLogo from "@/components/ThymosLogo";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, hideNav }: AppShellProps) {
  // TODO: Re-enable auth guard for production
  // Auth check temporarily disabled for development

  return (
    <div className="min-h-screen bg-sky-gradient relative overflow-hidden">
      <ThymosLogo />
      <OnboardingBackground />
      
      {/* Main content area with padding for bottom nav */}
      <main className="relative z-10 pt-20 pb-24 px-4 min-h-screen">
        {children}
      </main>
      
      <BottomNav />
    </div>
  );
}
