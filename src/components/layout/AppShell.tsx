import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";
import { BottomNav } from "@/components/navigation/BottomNav";
import ThymosLogo from "@/components/ThymosLogo";
import { LoadingState } from "@/components/onboarding/LoadingState";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/onboarding");
        return;
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/onboarding");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-gradient flex items-center justify-center relative overflow-hidden">
        <ThymosLogo />
        <OnboardingBackground />
        <div className="relative z-10">
          <LoadingState message="Loading..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
