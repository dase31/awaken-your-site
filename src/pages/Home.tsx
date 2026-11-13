import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { useReflections } from "@/hooks/useReflections";
import { ConnectionRequestCard } from "@/components/connections/ConnectionRequestCard";
import { ReflectionModal } from "@/components/reflections/ReflectionModal";
import { ChevronRight } from "lucide-react";
import { CircleIcon, BookIcon, SunIcon, RippleIcon } from "@/components/icons/ThymosIcons";
import { useUserSettings } from "@/hooks/useUserSettings";
import { acceptNotifications, declineNotifications } from "@/lib/push";
import { toast } from "sonner";

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

// A quick-link row: soft tinted circle, title, one line of context, chevron.
function QuickLink({
  icon,
  tint,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="th-glass-row w-full flex items-center gap-3.5 px-4 py-3.5 text-left active:scale-[0.99] transition-transform"
    >
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ background: tint }}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[0.95rem] font-medium text-[var(--th-ink)]">{title}</span>
        <span className="block text-[0.78rem] text-[var(--th-text-3)] mt-px">{sub}</span>
      </span>
      <ChevronRight size={16} className="text-[var(--th-text-3)] shrink-0" />
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
  const { reflections, saveReflection } = useReflections();
  const { settings, loading: settingsLoading, update: updateSettings } = useUserSettings();
  const askAboutNotifications = !settingsLoading && !settings.notificationsDecidedAt;

  const turnOnNotifications = async () => {
    const { denied, saved } = await acceptNotifications(updateSettings);
    if (denied) toast.info("Notifications are off for Thymos on this phone. You can change that in iOS Settings.");
    if (!saved) toast.error("Couldn't save that. Please try again.");
  };

  const now = new Date();
  const thisMonth = reflections.filter((r) => {
    const d = new Date(r.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const journalSub =
    thisMonth === 0 ? "Start with today's prompt" : `${thisMonth} reflection${thisMonth === 1 ? "" : "s"} this month`;

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
      <div className="max-w-md mx-auto pt-6">
        {/* Greeting sits straight on the sky */}
        <div className="px-2 pt-4 pb-9">
          <p className="th-on-sky text-[0.82rem] tracking-[0.04em] opacity-90 mb-1">{greeting}</p>
          <h1 className="th-display th-on-sky text-[2rem] font-normal leading-tight">
            Hi, {userName}
          </h1>
        </div>

        {/* Daily reflection */}
        <button
          onClick={() => setShowReflectionModal(true)}
          className="th-glass block w-full text-left px-[22px] pt-7 pb-5 active:scale-[0.99] transition-transform"
        >
          <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[var(--th-umber-light)] mb-2.5">
            Today's reflection
          </span>
          <span className="th-display block italic text-[1.2rem] leading-[1.35] text-[var(--th-ink)] mb-3.5">
            "{dailyPrompt}"
          </span>
          <span className="text-[0.85rem] font-medium text-[var(--th-ink)]">Tap to reflect →</span>
        </button>

        {/* Asked once; "Not now" is remembered and it stays in Settings */}
        {askAboutNotifications && (
          <div className="th-glass mt-3 p-5">
            <div className="flex items-start gap-3.5">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ background: "#E2E9F1" }}
              >
                <RippleIcon width={22} height={22} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.95rem] font-medium text-[var(--th-ink)]">Know when someone reaches out</p>
                <p className="mt-0.5 text-[0.8rem] leading-snug text-[var(--th-text-2)]">
                  We'll tell you when someone connects or messages you. Never what was said.
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <button type="button" className="th-btn px-5 py-2 text-[0.85rem]" onClick={turnOnNotifications}>
                    Turn on
                  </button>
                  <button type="button" className="th-text-link" onClick={() => declineNotifications(updateSettings)}>
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="relative z-10 text-[0.72rem] uppercase tracking-[0.1em] text-[var(--th-text-2)] mt-8 mb-2.5 px-2">
          Quick links
        </p>
        <div className="flex flex-col gap-2.5">
          {connectionsLoading ? (
            <div className="th-glass-row h-[68px] animate-pulse" />
          ) : (
            <QuickLink
              icon={<CircleIcon width={22} height={22} />}
              tint="#E2E9F1"
              title="Connections"
              sub={incoming.length > 0 ? `${incoming.length} new request${incoming.length === 1 ? "" : "s"}` : "No new requests"}
              onClick={() => navigate("/connect")}
            />
          )}
          <QuickLink
            icon={<BookIcon width={22} height={22} />}
            tint="#E9E2D4"
            title="Journal"
            sub={journalSub}
            onClick={() => navigate("/reflections")}
          />
          <QuickLink
            icon={<SunIcon width={22} height={22} />}
            tint="#E4E7DB"
            title="Find support"
            sub={settings.matchingPaused ? "Matching is paused" : "Get matched with a peer"}
            onClick={() => navigate("/match")}
          />
        </div>

        {/* Incoming requests still need room to be acted on */}
        {!connectionsLoading && incoming.length > 0 && (
          <div className="mt-6 space-y-2.5">
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
