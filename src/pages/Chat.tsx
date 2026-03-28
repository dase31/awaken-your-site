import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useConversations } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";
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
  const initial = name.charAt(0).toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4",
        "bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl",
        "transition-all duration-300 hover:bg-white/15 active:scale-[0.98]",
        "text-left"
      )}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
        <span className="font-serif text-white text-lg">{initial}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3
              className="font-serif text-white text-base truncate"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
            >
              {name}
            </h3>
            {conversationType === "telos" && (
              <span className="text-[10px] font-medium uppercase tracking-wide bg-white/15 border border-white/20 text-white/70 px-1.5 py-0.5 rounded-full">
                Telos
              </span>
            )}
          </div>
          <span className="text-white/50 text-xs shrink-0">{timeAgo}</span>
        </div>
        <p className="text-white/60 text-sm truncate mt-0.5">
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
        <h1
          className="font-serif text-white text-2xl md:text-3xl mb-6"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
        >
          Messages
        </h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/10 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map(convo => (
              <ConversationCard
                key={convo.id}
                name={convo.otherUserName}
                lastMessage={convo.lastMessage}
                timestamp={convo.lastMessageAt}
                onClick={() => navigate(`/chat/${convo.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p
              className="font-serif text-white/70 text-lg mb-2"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
            >
              No conversations yet
            </p>
            <p className="text-white/50 text-sm mb-8 max-w-xs">
              When you connect with someone, your conversations will appear here.
            </p>

            <button
              onClick={() => navigate("/match")}
              className={cn(
                "w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5",
                "transition-all duration-300 hover:bg-white/15 active:scale-[0.98]"
              )}
            >
              <p
                className="font-serif text-white text-base mb-2"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
              >
                Ready to connect?
              </p>
              <span className="inline-flex items-center text-white/80 font-medium text-sm">
                Find a connection →
              </span>
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Chat;
