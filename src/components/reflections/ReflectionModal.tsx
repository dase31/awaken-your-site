import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ReflectionModalProps {
  prompt: string;
  onSave: (prompt: string, response: string) => Promise<boolean>;
  onClose: () => void;
}

export function ReflectionModal({ prompt, onSave, onClose }: ReflectionModalProps) {
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!response.trim()) return;
    setSaving(true);
    const success = await onSave(prompt, response.trim());
    setSaving(false);
    if (success) onClose();
  };

  // Portaled to <body> so it sits above the tab bar instead of inside the page's layer.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Today's reflection"
    >
      <div
        className="absolute inset-0 bg-[rgba(28,27,24,0.35)] backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="th-glass relative w-full max-w-md p-6 !rounded-[28px] !bg-[rgba(252,251,247,0.92)]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full border border-[var(--th-line)] text-[var(--th-text-2)]"
        >
          <X size={16} />
        </button>

        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[var(--th-umber-light)] mb-2.5">
          Today's reflection
        </p>
        <p className="th-display italic text-[1.2rem] leading-[1.35] text-[var(--th-ink)] mb-5 pr-8">
          "{prompt}"
        </p>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write your thoughts…"
          rows={5}
          autoFocus
          className="w-full bg-[var(--th-paper)] border border-[var(--th-line)] rounded-2xl px-4 py-3 text-[0.9rem] text-[var(--th-ink)] placeholder:text-[var(--th-text-3)] resize-none outline-none focus:border-[rgba(28,27,24,0.3)] transition-colors"
        />

        <button
          onClick={handleSave}
          disabled={!response.trim() || saving}
          className="w-full mt-4 py-3 rounded-full bg-[var(--th-ink)] text-[var(--th-paper)] font-medium text-[0.92rem] transition-opacity disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save reflection"}
        </button>
      </div>
    </div>,
    document.body
  );
}
