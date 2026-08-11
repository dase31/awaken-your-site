import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { useReflections } from "@/hooks/useReflections";
import { ConnectionRequestCard } from "@/components/connections/ConnectionRequestCard";
import { ReflectionModal } from "@/components/reflections/ReflectionModal";
import { cn } from "@/lib/utils";
import { Users, BookOpen, HeartHandshake, ChevronRight } from "lucide-react";

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
        "bg-white/12 backdrop-blur-xl border border-white/20 rounded-2xl p-5",
        "transition-all duration-300",
        onClick && "cursor-pointer hover:bg-white/16 active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}

// A much lighter alternative to GlassCard — icon, one line, an arrow.
// For actions that don't need to compete visually with the reflection card.
function ActionRow({
  icon,
  label,
  trailing,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  trailing?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-1 text-left group"
    >
      <span className="text-white/50">{icon}</span>
      <span className="text-white/85 text-base font-medium flex-1">{label}</span>
      {trailing && <span className="text-white/40 text-sm">{trailing}</span>}
      <ChevronRight size={16} className="text-white/30 group-hover:text-white/50 transition-colors" />
    </button>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const greeting = getGreeting();
  const dailyPrompt = getDailyPrompt();

  const { incoming, loading: connectionsLoading, respondToRequest } = useConnectionRequests();
  const { saveReflection } = useReflections();

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

        {/* Daily Reflection Card — hero card */}
        <GlassCard
          onClick={() => setShowReflectionModal(true)}
          className="!bg-white/25 !border-white/40 !p-6"
        >
          <h2 className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">
            Today's Reflection
          </h2>
          <p
            className="font-serif text-white text-2xl leading-snug mb-5"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            "{dailyPrompt}"
          </p>
          <span className="text-white/70 text-sm font-medium hover:text-white transition-colors">
            Tap to reflect →
          </span>
        </GlassCard>

        {/* Secondary actions — light rows, not competing with the reflection card */}
        <div className="space-y-1 px-1">
          {connectionsLoading ? (
            <div className="h-6 bg-white/10 rounded-md animate-pulse" />
          ) : (
            <ActionRow
              icon={<Users size={18} />}
              label="Connections"
              trailing={incoming.length > 0 ? `${incoming.length} new` : "No new requests"}
              onClick={() => navigate("/connect")}
            />
          )}
          <ActionRow
            icon={<BookOpen size={18} />}
            label="Journal"
            onClick={() => navigate("/reflections")}
          />
          <ActionRow
            icon={<HeartHandshake size={18} />}
            label="Find support"
            onClick={() => navigate("/match")}
          />
        </div>

        {/* Incoming requests still need real estate to actually act on */}
        {!connectionsLoading && incoming.length > 0 && (
          <div className="space-y-3">
            {incoming.map(req => (
              <ConnectionRequestCard
                key={req.id}
                request={req}
                onAccept={(id) => respondToRequest(id, true)}
                onReject={(id) => respondToRequest(id, false)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reflection Modal */}
      {showReflectionModal && (
        <ReflectionModal
          prompt={dailyPrompt}
          onSave={saveReflection}
          onClose={() => setShowReflectionModal(false)}
        />
      )}
    </AppShell>
  );
};

export default Home;
