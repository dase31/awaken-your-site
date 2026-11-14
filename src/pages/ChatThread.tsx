import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useChatMessages } from "@/hooks/useChatMessages";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
import { PersonAvatar } from "@/components/PersonAvatar";
import { cn } from "@/lib/utils";
import { format, isToday, isValid, isYesterday } from "date-fns";
import { SafetyMenu } from "@/components/safety/SafetyMenu";
import { toast } from "sonner";

// A message with a missing or malformed timestamp should render without one,
// not throw and take the whole screen down.
function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  return isValid(date) ? format(date, "h:mm a") : "";
}

function formatDateSeparator(dateStr: string) {
  const date = new Date(dateStr);
  if (!isValid(date)) return "";
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d, yyyy");
}

const ChatThread = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { messages, loading, sendMessage } = useChatMessages(conversationId);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState("");
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      if (!conversationId) return;
      const { data: convo } = await supabase
        .from("conversations")
        .select("user_one, user_two")
        .eq("id", conversationId)
        .maybeSingle();

      if (!convo) return;
      const otherId = convo.user_one === user.id ? convo.user_two : convo.user_one;
      setOtherUserId(otherId);

      const { data: profile } = await supabase
        .from("public_profiles")
        .select("display_name")
        .eq("id", otherId)
        .maybeSingle();

      setOtherUserName(profile?.display_name ?? "Unknown");
    };
    init();
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    const result = await sendMessage(trimmed);
    if (result?.ok !== true) {
      // Give them their words back so nothing is lost.
      setInput(trimmed);
      toast.error(
        result?.ok === false && result.reason === "objectionable"
          ? "That message includes language we don't allow."
          : "That message couldn't be sent. Please try again."
      );
    }
  };

  // Snapshot of the recent conversation, attached to a report so a
  // moderator can see what was said even if it's later deleted.
  const getReportContext = () =>
    messages
      .slice(-10)
      .map((m) => `${m.senderId === currentUserId ? "Reporter" : otherUserName}: ${m.content}`)
      .join("\n");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  let lastDate = "";

  return (
    <AppShell
     
      hideNav
      fill
      onBack={() => navigate("/chat")}
      actions={
        otherUserId && conversationId ? (
          <SafetyMenu
            tone="sky"
            targetUserId={otherUserId}
            targetName={otherUserName || "this person"}
            conversationId={conversationId}
            getContext={getReportContext}
            onBlocked={() => navigate("/chat")}
          />
        ) : (
          <span />
        )
      }
    >
      <div className="max-w-md w-full mx-auto flex flex-col flex-1 min-h-0">
        {/* Who you're talking to */}
        <div className="flex items-center gap-3 px-2 pt-3 pb-4">
          <PersonAvatar name={otherUserName} size={44} />
          <h1 className="th-display th-on-sky text-[1.5rem] font-normal leading-tight break-words">
            {otherUserName}
          </h1>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="th-on-sky text-sm">Loading messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="th-glass-row px-5 py-3 text-[0.9rem] text-[var(--th-text-2)] text-center">
                Say hello.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;
              const msgDate = formatDateSeparator(msg.createdAt);
              let showDate = false;
              if (msgDate !== lastDate) {
                showDate = true;
                lastDate = msgDate;
              }

              return (
                <div key={msg.id}>
                  {showDate && msgDate && (
                    <div className="flex justify-center my-4">
                      <span className="th-glass-row !rounded-full text-[var(--th-text-2)] text-xs px-3 py-1">
                        {msgDate}
                      </span>
                    </div>
                  )}
                  <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] px-4 py-2.5",
                        isMine
                          ? "bg-[var(--th-ink)] text-[var(--th-paper)] rounded-2xl rounded-br-md"
                          : "th-glass-row !rounded-2xl !rounded-bl-md text-[var(--th-ink)]"
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={cn(
                          "text-[10px] mt-1",
                          isMine ? "text-[rgba(252,251,247,0.6)] text-right" : "text-[var(--th-text-3)]"
                        )}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input bar */}
        <div
          className="flex items-end gap-2 pt-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="th-glass-row !rounded-[22px] flex-1 px-4 py-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              aria-label="Message"
              className="w-full bg-transparent text-[var(--th-ink)] text-sm placeholder:text-[var(--th-text-3)] resize-none outline-none max-h-24"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send"
            className="w-11 h-11 flex items-center justify-center rounded-full shrink-0 bg-[var(--th-ink)] text-[var(--th-paper)] transition-opacity disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default ChatThread;
