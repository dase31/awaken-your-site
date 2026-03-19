import { cn } from "@/lib/utils";
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
    <div
      className={cn(
        "flex items-center gap-4 p-4",
        "bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl"
      )}
    >
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
        <span className="font-serif text-white text-lg">{initial}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-serif text-white text-base truncate"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
        >
          {request.senderName}
        </p>
        <p className="text-white/50 text-xs">{timeAgo}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onAccept(request.id)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 border border-white/30 hover:bg-white/30 transition-all"
        >
          <Check size={16} className="text-white" />
        </button>
        <button
          onClick={() => onReject(request.id)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 hover:bg-white/20 transition-all"
        >
          <X size={16} className="text-white/60" />
        </button>
      </div>
    </div>
  );
}
