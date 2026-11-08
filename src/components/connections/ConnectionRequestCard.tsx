import { Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ConnectionRequest } from "@/hooks/useConnectionRequests";

interface ConnectionRequestCardProps {
  request: ConnectionRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function ConnectionRequestCard({ request, onAccept, onReject }: ConnectionRequestCardProps) {
  const initial = request.senderName.charAt(0).toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });

  return (
    <div className="th-glass-row flex items-center gap-3.5 px-4 py-3.5">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white th-display text-base font-medium"
        style={{ background: "var(--th-sage)" }}
      >
        {initial}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[0.95rem] font-medium text-[var(--th-ink)] truncate">{request.senderName}</p>
        <p className="text-[0.72rem] text-[var(--th-text-3)]">{timeAgo}</p>
      </div>

      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onAccept(request.id)}
          aria-label={`Accept ${request.senderName}`}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--th-ink)] text-[var(--th-paper)] active:scale-95 transition-transform"
        >
          <Check size={16} />
        </button>
        <button
          onClick={() => onReject(request.id)}
          aria-label={`Decline ${request.senderName}`}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--th-line)] text-[var(--th-text-2)] active:scale-95 transition-transform"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
