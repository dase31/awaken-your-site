import { AppShell } from "@/components/layout/AppShell";
import { PageHead } from "@/components/layout/PageHead";
import { PersonAvatar } from "@/components/PersonAvatar";
import { CircleIcon } from "@/components/icons/ThymosIcons";
import { useConnectionRequests } from "@/hooks/useConnectionRequests";
import { ConnectionRequestCard } from "@/components/connections/ConnectionRequestCard";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Clock } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

export default function Connect() {
  const { incoming, outgoing, accepted, loading, respondToRequest } = useConnectionRequests();
  const navigate = useNavigate();
  const [pendingOpen, setPendingOpen] = useState(true);

  const sentPending = outgoing.filter((r) => r.status === "pending");
  const hasContent = incoming.length > 0 || accepted.length > 0 || sentPending.length > 0;

  return (
    <AppShell>
      <div className="max-w-md mx-auto">
        <PageHead title="Your circle" sub="People you check in with." />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          </div>
        ) : !hasContent ? (
          <div className="th-glass text-center px-7 py-9">
            <div className="w-16 h-16 rounded-full bg-[#E2E9F1] flex items-center justify-center mx-auto mb-4">
              <CircleIcon width={30} height={30} />
            </div>
            <p className="th-display text-[1.2rem] font-medium text-[var(--th-ink)] mb-2">
              Your circle is empty
            </p>
            <p className="text-[0.86rem] leading-relaxed text-[var(--th-text-2)] mb-5 max-w-[240px] mx-auto">
              Find someone who shares what you're going through
            </p>
            <button onClick={() => navigate("/match")} className="th-btn">
              Find a match
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {incoming.length > 0 && (
              <Collapsible open={pendingOpen} onOpenChange={setPendingOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full mb-2.5 px-2">
                  <span className="th-label !text-[var(--th-text-2)]">Pending requests</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--th-ink)] text-[var(--th-paper)] text-[0.7rem] font-medium">
                    {incoming.length}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-[var(--th-text-2)] ml-auto transition-transform ${pendingOpen ? "rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2.5">
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

            {sentPending.length > 0 && (
              <div className="space-y-2.5">
                <p className="th-label !text-[var(--th-text-2)] px-2">Sent requests</p>
                {sentPending.map((req) => (
                  <div key={req.id} className="th-glass-row flex items-center gap-3.5 px-4 py-3.5">
                    <PersonAvatar name={req.receiverName} />
                    <p className="text-[0.95rem] font-medium text-[var(--th-ink)] flex-1 truncate">
                      {req.receiverName}
                    </p>
                    <span className="flex items-center gap-1.5 text-[var(--th-text-3)] text-xs">
                      <Clock size={12} />
                      Waiting
                    </span>
                  </div>
                ))}
              </div>
            )}

            {accepted.length > 0 && (
              <div className="space-y-2.5">
                <p className="th-label !text-[var(--th-text-2)] px-2">Your connections</p>
                {accepted.map((conn) => (
                  <div key={conn.otherId} className="th-glass-row flex items-center gap-3.5 px-4 py-3.5">
                    <PersonAvatar name={conn.displayName} />
                    <p className="text-[0.95rem] font-medium text-[var(--th-ink)] flex-1 truncate">
                      {conn.displayName}
                    </p>
                    {conn.conversationId ? (
                      <button
                        onClick={() => navigate(`/chat/${conn.conversationId}`)}
                        className="text-[0.78rem] font-medium bg-[var(--th-ink)] text-[var(--th-paper)] px-3.5 py-1.5 rounded-full shrink-0 active:scale-95 transition-transform"
                      >
                        Chat
                      </button>
                    ) : (
                      <span className="text-[var(--th-text-3)] text-xs">No chat yet</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => navigate("/match")} className="th-ghost-row">
              Find a new match →
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
