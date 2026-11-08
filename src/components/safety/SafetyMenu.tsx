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
  /** "sky" when the button sits straight on the background, "glass" on a card. */
  tone?: "sky" | "glass";
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
  tone = "glass",
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
    "w-full flex items-center gap-3 px-5 py-4 text-left text-[var(--th-ink)] text-base hover:bg-black/5 transition-colors";
  const primary =
    "w-full py-3 rounded-full font-medium text-sm bg-[var(--th-ink)] text-[var(--th-paper)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed";
  const quiet = "w-full py-3 text-[var(--th-text-2)] text-sm hover:text-[var(--th-ink)] transition-colors";

  const sheet = (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[rgba(28,27,24,0.35)] backdrop-blur-sm p-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))", paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="th-sheet w-full max-w-sm overflow-hidden fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {view === "menu" && (
          <>
            <p className="th-label px-5 pt-5 pb-2">{targetName}</p>
            <button className={row} onClick={() => setView("report")}>
              <Flag size={18} className="text-[var(--th-text-2)]" /> Report
            </button>
            <button className={row} onClick={() => setView("block")}>
              <Ban size={18} className="text-[var(--th-text-2)]" /> Block
            </button>
            <button
              className={cn(row, "justify-center text-[var(--th-text-2)] border-t border-[var(--th-line)]")}
              onClick={close}
            >
              Cancel
            </button>
          </>
        )}

        {view === "report" && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="th-display text-[1.3rem] text-[var(--th-ink)]">What's going on?</h2>
              <button onClick={close} aria-label="Close" className="text-[var(--th-text-2)] hover:text-[var(--th-ink)]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  aria-pressed={reason === r.value}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-2xl border text-sm transition-colors",
                    reason === r.value
                      ? "bg-[var(--th-ink)] border-[var(--th-ink)] text-[var(--th-paper)]"
                      : "bg-[var(--th-paper)] border-[var(--th-line)] text-[var(--th-ink)] hover:bg-white"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {reason === "self_harm" && (
              <p className="text-[var(--th-text-2)] text-xs leading-relaxed mb-4">
                If you think they might be in danger right now, please contact local emergency
                services. You can also find{" "}
                <Link to="/crisis" className="underline underline-offset-2 text-[var(--th-ink)]">
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
              className="th-field resize-none mb-4"
            />

            <button onClick={submitReport} disabled={!reason || busy} className={primary}>
              {busy ? "Sending…" : "Send report"}
            </button>
          </div>
        )}

        {view === "reported" && (
          <div className="p-6 text-center">
            <h2 className="th-display text-[1.5rem] text-[var(--th-ink)] mb-2">Thank you</h2>
            <p className="text-[var(--th-text-2)] text-sm leading-relaxed mb-6">
              We'll review your report. You can also block {targetName} so you don't hear from
              them or see them again.
            </p>
            <button onClick={() => setView("block")} className={cn(primary, "mb-2")}>
              Block {targetName}
            </button>
            <button onClick={close} className={quiet}>Not now</button>
          </div>
        )}

        {view === "block" && (
          <div className="p-6 text-center">
            <h2 className="th-display text-[1.5rem] text-[var(--th-ink)] mb-2">Block {targetName}?</h2>
            <p className="text-[var(--th-text-2)] text-sm leading-relaxed mb-6">
              You won't be able to message each other, and you won't see each other in matches or
              Telos. They won't be told. You can undo this any time in Settings.
            </p>
            <button
              onClick={confirmBlock}
              disabled={busy}
              className="w-full py-3 rounded-full font-medium text-sm bg-[#9b4a3c] text-white active:scale-[0.98] transition-all mb-2 disabled:opacity-50"
            >
              {busy ? "Blocking…" : "Block"}
            </button>
            <button onClick={close} className={quiet}>Cancel</button>
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
          tone === "sky"
            ? "th-icon-btn"
            : "w-10 h-10 flex items-center justify-center rounded-full text-[var(--th-text-2)] hover:bg-black/5 transition-colors",
          className
        )}
      >
        <MoreHorizontal size={20} />
      </button>
      {view !== "closed" && createPortal(sheet, document.body)}
    </>
  );
}
