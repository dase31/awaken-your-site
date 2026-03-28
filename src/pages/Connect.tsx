import { AppShell } from "@/components/layout/AppShell";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { ConnectionRequestCard } from "@/components/connections/ConnectionRequestCard";
import { useNavigate } from "react-router-dom";
import { ChevronDown, MessageCircle, Users, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

export default function Connect() {
  const { incoming, accepted, loading, respondToRequest } = useConnectionRequests();
  const navigate = useNavigate();
  const [pendingOpen, setPendingOpen] = useState(true);

  const hasContent = incoming.length > 0 || accepted.length > 0;

  return (
    <AppShell>
      <div className="px-6 pt-6 pb-24 space-y-6">
        <h1
          className="font-serif text-2xl text-white text-center"
          style={{ textShadow: "0 2px 15px rgba(0,0,0,0.15)" }}
        >
          Your Circle
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : !hasContent ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <Users size={28} className="text-white/40" />
            </div>
            <p
              className="font-serif text-white/70 text-lg text-center"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
            >
              Your circle is empty
            </p>
            <p className="text-white/50 text-sm text-center max-w-[240px]">
              Find someone who shares what you're going through
            </p>
            <button
              onClick={() => navigate("/match")}
              className="mt-2 px-6 py-3 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition-all"
            >
              Find a match →
            </button>
          </div>
        ) : (
          <>
            {/* Pending Requests */}
            {incoming.length > 0 && (
              <Collapsible open={pendingOpen} onOpenChange={setPendingOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full mb-3">
                  <span className="text-white/80 text-sm font-medium">Pending Requests</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">
                    {incoming.length}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-white/50 ml-auto transition-transform ${pendingOpen ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3">
                  {incoming.map((req) => (
                    <ConnectionRequestCard
                      key={req.id}
                      request={req}
                      onAccept={(id) => respondToRequest(id, true)}
                      onReject={(id) => respondToRequest(id, false)}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Active Connections */}
            {accepted.length > 0 && (
              <div className="space-y-3">
                <span className="text-white/80 text-sm font-medium">Your Connections</span>
                {accepted.map((conn) => {
                  const initial = conn.displayName.charAt(0).toUpperCase();
                  return (
                    <div
                      key={conn.oderId}
                      className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl"
                    >
                      <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                        <span className="font-serif text-white text-lg">{initial}</span>
                      </div>
                      <p
                        className="font-serif text-white text-base flex-1 truncate"
                        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
                      >
                        {conn.displayName}
                      </p>
                      {conn.conversationId ? (
                        <button
                          onClick={() => navigate(`/chat/${conn.conversationId}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-white/80 text-sm hover:bg-white/25 transition-all"
                        >
                          <MessageCircle size={14} />
                          Chat
                        </button>
                      ) : (
                        <span className="text-white/40 text-xs">No chat yet</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Find Someone New */}
            <button
              onClick={() => navigate("/match")}
              className="w-full flex items-center justify-center gap-2 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white/80 hover:bg-white/20 hover:text-white transition-all"
            >
              <Sparkles size={16} />
              <span className="font-medium text-sm">Find a new match →</span>
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
