import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const dailyPrompts = [
  "What's weighing on you today?",
  "What would bring you peace right now?",
  "What are you grateful for?",
  "What do you need to let go of?",
  "What's one small step you can take today?",
];

function getDailyPrompt(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dailyPrompts[dayOfYear % dailyPrompts.length];
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function GlassCard({ children, className, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-lg shadow-black/5",
        "transition-all duration-300",
        onClick && "cursor-pointer hover:bg-white/25 active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const greeting = getGreeting();
  const dailyPrompt = getDailyPrompt();

  useEffect(() => {
    const loadUserName = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", session.user.id)
          .maybeSingle();
        
        setUserName(profile?.display_name || "Friend");
      }
    };

    loadUserName();
  }, []);

  return (
    <AppShell>
      <div className="max-w-md mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1
            className="font-serif text-white text-2xl md:text-3xl"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
          >
            {greeting}, {userName}
          </h1>
        </div>

        {/* Daily Reflection Card */}
        <GlassCard>
          <h2 className="text-white/80 text-sm uppercase tracking-wide mb-3 font-medium">
            Today's Reflection
          </h2>
          <p
            className="font-serif text-white text-lg italic mb-4"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            "{dailyPrompt}"
          </p>
          <button className="text-white/70 text-sm hover:text-white font-medium transition-colors">
            Tap to reflect →
          </button>
        </GlassCard>

        {/* Pending Connections Card */}
        <GlassCard>
          <h2 className="text-white/80 text-sm uppercase tracking-wide mb-3 font-medium">
            Your Connections
          </h2>
          <p className="text-white/70 text-base">
            No pending connections yet.
          </p>
          <p className="text-white/60 text-sm mt-2">
            When someone wants to connect, you'll see them here.
          </p>
        </GlassCard>

        {/* Find Support Card */}
        <GlassCard onClick={() => navigate("/match")}>
          <h2 className="text-white/80 text-sm uppercase tracking-wide mb-3 font-medium">
            Find Support
          </h2>
          <p className="text-white text-base mb-4">
            Connect with someone who understands what you're going through.
          </p>
          <span className="inline-flex items-center text-white font-medium text-sm hover:underline">
            Find a match →
          </span>
        </GlassCard>
      </div>
    </AppShell>
  );
};

export default Home;
