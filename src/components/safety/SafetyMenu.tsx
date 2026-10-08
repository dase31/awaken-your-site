import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { MoreHorizontal, Flag, Ban, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  REPORT_REASONS,
  blockUser,
  fileReport,
  type ReportReason,
} from "@/lib/blocks";

interface SafetyMenuProps {
  targetUserId: string;
  targetName: string;
  conversationId?: string;
  telosPostId?: string;
  // Lazily builds the snapshot attached to a report (recent messages, post text).
  getContext?: () => string;
  onBlocked?: () => void;
  className?: string;
}

type View = "closed" | "menu" | "report" | "reported" | "block";

export function SafetyMenu({
  targetUserId,
  targetName,
  conversationId,
  telosPostId,
  getContext,
  onBlocked,
  className,
}: SafetyMenuProps) {
  const [view, setView] = useState<View>("closed");
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  const close = () => {
    setView("closed");
    setReason(null);
    setDetails("");
    setBusy(false);
  };

  const submitReport = async () => {
    if (!reason || busy) return;
    setBusy(true);
    const ok = await fileReport({
      reportedUserId: targetUserId,
      reportedName: targetName,
      reason,
      details,
      conversationId,
      telosPostId,
      context: getContext?.(),
    });
    setBusy(false);
    if (!ok) {
      toast.error("Couldn't send your report. Please try again.");
      return;
    }
    setView("reported");
  };

  const confirmBlock = async () => {
    if (busy) return;
    setBusy(true);
    const ok = await blockUser(targetUserId);
    setBusy(false);
    if (!ok) {
      toast.error("Couldn't block them. Please try again.");
      return;
    }
    toast.success(`${targetName} is blocked.`);
    close();
    onBlocked?.();
  };

  const row =
    "w-full flex items-center gap-3 px-5 py-4 text-left text-white text-base hover:bg-white/10 transition-colors";

  const sheet = (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm bg-[hsl(200,60%,40%)]/95 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden fade-in-up"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {view === "menu" && (
          <>
            <p className="px-5 pt-5 pb-2 text-white/50 text-xs font-semibold uppercase tracking-widest">
              {targetName}
            </p>
            <button className={row} onClick={() => setView("report")}>
              <Flag size={18} className="text-white/70" /> Report
            </button>
            <button className={row} onClick={() => setView("block")}>
              <Ban size={18} className="text-white/70" /> Block
            </button>
            <button
              className={cn(row, "justify-center text-white/60 border-t border-white/10")}
              onClick={close}
            >
              Cancel
            </button>
          </>
        )}

        {view === "report" && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-white text-xl">What's going on?</h2>
              <button onClick={close} aria-label="Close" className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors",
                    reason === r.value
                      ? "bg-white/25 border-white/50 text-white"
                      : "bg-white/10 border-white/15 text-white/80 hover:bg-white/15"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {reason === "self_harm" && (
              <p className="text-white/70 text-xs leading-relaxed mb-4">
                If you think they might be in danger right now, please contact local emergency
                services. You can also find{" "}
                <Link to="/crisis" className="underline underline-offset-2 text-white">
                  crisis resources here
                </Link>
                .
              </p>
            )}

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
              placeholder="Anything else we should know? (optional)"
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white text-sm placeholder:text-white/40 resize-none focus:outline-none focus:border-white/40 mb-4"
            />

            <button
              onClick={submitReport}
              disabled={!reason || busy}
              className="w-full py-3 rounded-full font-semibold text-sm bg-white/20 border border-white/40 text-white hover:bg-white/30 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? "Sending…" : "Send report"}
            </button>
          </div>
        )}

        {view === "reported" && (
          <div className="p-6 text-center">
            <h2 className="font-serif text-white text-2xl mb-2">Thank you</h2>
            <p className="text-white/75 text-sm leading-relaxed mb-6">
              We'll review your report. You can also block {targetName} so you don't hear from
              them or see them again.
            </p>
            <button
              onClick={() => setView("block")}
              className="w-full py-3 rounded-full font-semibold text-sm bg-white/20 border border-white/40 text-white hover:bg-white/30 transition-all mb-2"
            >
              Block {targetName}
            </button>
            <button onClick={close} className="w-full py-3 text-white/60 text-sm hover:text-white transition-colors">
              Not now
            </button>
          </div>
        )}

        {view === "block" && (
          <div className="p-6 text-center">
            <h2 className="font-serif text-white text-2xl mb-2">Block {targetName}?</h2>
            <p className="text-white/75 text-sm leading-relaxed mb-6">
              You won't be able to message each other, and you won't see each other in matches or
              Telos. They won't be told. You can undo this any time in Settings.
            </p>
            <button
              onClick={confirmBlock}
              disabled={busy}
              className="w-full py-3 rounded-full font-semibold text-sm bg-red-400/25 border border-red-300/40 text-white hover:bg-red-400/35 transition-all mb-2 disabled:opacity-50"
            >
              {busy ? "Blocking…" : "Block"}
            </button>
            <button onClick={close} className="w-full py-3 text-white/60 text-sm hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setView("menu");
        }}
        aria-label={`Report or block ${targetName}`}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors",
          className
        )}
      >
        <MoreHorizontal size={20} />
      </button>
      {view !== "closed" && createPortal(sheet, document.body)}
    </>
  );
}
