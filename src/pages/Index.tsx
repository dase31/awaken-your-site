import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  const navigate = useNavigate();

  // Safety net for auth links that land here instead of /auth/callback.
  // Supabase falls back to the Site URL (this page) when a requested
  // emailRedirectTo isn't in its allowlist, which would otherwise strand a
  // freshly signed-in user on the landing page. Hand off to /auth/callback,
  // which resolves where they actually belong.
  useEffect(() => {
    let cancelled = false;

    const handoff = () => {
      if (!cancelled) navigate("/auth/callback", { replace: true });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handoff();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) handoff();
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="h-screen overflow-hidden bg-sky-gradient">
      <Header />
      <main>
        <HeroSection />
      </main>
    </div>
  );
};

export default Index;
