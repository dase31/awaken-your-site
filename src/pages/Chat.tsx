import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PageHead } from "@/components/layout/PageHead";
import { PersonAvatar } from "@/components/PersonAvatar";
import { useConversations } from "@/hooks/useConversations";
import { formatDistanceToNow } from "date-fns";

function ConversationCard({
  name,
  lastMessage,
  timestamp,
  conversationType,
  onClick,
}: {
  name: string;
  lastMessage: string | null;
  timestamp: string;
  conversationType: string;
  onClick: () => void;
}) {
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <button
      onClick={onClick}
      className="th-glass-row w-full flex items-center gap-3.5 px-4 py-3.5 text-left active:scale-[0.99] transition-transform"
    >
      <PersonAvatar name={name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[0.95rem] font-medium text-[var(--th-ink)] truncate">{name}</span>
            {conversationType === "telos" && (
              <span className="text-[10px] font-medium uppercase tracking-wide bg-[#E4E7DB] text-[var(--th-sage-deep)] px-1.5 py-0.5 rounded-full shrink-0">
                Telos
              </span>
            )}
          </div>
          <span className="text-[0.72rem] text-[var(--th-text-3)] shrink-0">{timeAgo}</span>
        </div>
        <p className="text-[0.84rem] text-[var(--th-text-2)] truncate mt-0.5">
          {lastMessage ?? "Start a conversation…"}
        </p>
      </div>
    </button>
  );
}

const Chat = () => {
  const navigate = useNavigate();
  const { conversations, loading } = useConversations();

  return (
    <AppShell>
      <div className="max-w-md mx-auto">
        <PageHead title="Messages" sub="Your quiet one-on-ones." />

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="th-glass-row h-[76px] animate-pulse" />
            ))}
          </div>
        ) : conversations.length > 0 ? (
          <div className="space-y-2.5">
            {conversations.map(convo => (
              <ConversationCard
                key={convo.id}
                name={convo.otherUserName}
                lastMessage={convo.lastMessage}
                timestamp={convo.lastMessageAt}
                conversationType={convo.conversationType}
                onClick={() => navigate(`/chat/${convo.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="th-glass text-center px-7 py-9">
            <p className="th-display text-[1.2rem] font-medium text-[var(--th-ink)] mb-2">
              No conversations yet
            </p>
            <p className="text-[0.86rem] leading-relaxed text-[var(--th-text-2)] mb-5">
              When you connect with someone, your conversations will appear here.
            </p>
            <button onClick={() => navigate("/match")} className="th-btn">
              Find someone to talk to
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Chat;
