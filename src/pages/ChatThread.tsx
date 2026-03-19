import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useChatMessages } from "@/hooks/useChatMessages";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  return format(date, "h:mm a");
}

function formatDateSeparator(dateStr: string) {
  const date = new Date(dateStr);
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

      const { data: profile } = await supabase
        .from("profiles")
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
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  let lastDate = "";

  return (
    <AppShell hideNav>
      <div className="max-w-md mx-auto flex flex-col h-[calc(100vh-5rem)] -mb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/chat")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition-all"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
            <span className="font-serif text-white text-lg">
              {otherUserName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1
            className="font-serif text-white text-xl"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
          >
            {otherUserName}
          </h1>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-2 pr-1 pb-2"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/50 text-sm">Loading messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/50 text-sm text-center">
                Say hello 👋
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
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-white/40 text-xs bg-white/10 rounded-full px-3 py-1">
                        {msgDate}
                      </span>
                    </div>
                  )}
                  <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] px-4 py-2.5 backdrop-blur-sm border",
                        isMine
                          ? "bg-white/25 border-white/30 rounded-2xl rounded-br-md"
                          : "bg-white/12 border-white/15 rounded-2xl rounded-bl-md"
                      )}
                    >
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <p className={cn(
                        "text-[10px] mt-1",
                        isMine ? "text-white/50 text-right" : "text-white/40"
                      )}>
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
        <div className="flex items-end gap-2 pt-3 pb-2">
          <div className="flex-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              className="w-full bg-transparent text-white text-sm placeholder:text-white/40 resize-none outline-none max-h-24"
              style={{ caretColor: "white" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              "w-11 h-11 flex items-center justify-center rounded-full shrink-0",
              "bg-white/25 border border-white/30 backdrop-blur-sm",
              "hover:bg-white/35 transition-all duration-200",
              "disabled:opacity-40 disabled:hover:bg-white/25"
            )}
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default ChatThread;
