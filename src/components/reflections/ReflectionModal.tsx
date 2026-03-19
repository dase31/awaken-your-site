import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all"
        >
          <X size={16} className="text-white/70" />
        </button>

        {/* Prompt */}
        <h2 className="text-white/70 text-sm uppercase tracking-wide mb-3 font-medium">
          Today's Reflection
        </h2>
        <p
          className="font-serif text-white text-lg italic mb-6"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
        >
          "{prompt}"
        </p>

        {/* Input */}
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write your thoughts…"
          rows={5}
          className={cn(
            "w-full bg-white/10 border border-white/15 rounded-2xl px-4 py-3",
            "text-white text-sm placeholder:text-white/35 resize-none outline-none",
            "focus:border-white/30 transition-colors"
          )}
          style={{ caretColor: "white" }}
          autoFocus
        />

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!response.trim() || saving}
          className={cn(
            "w-full mt-4 py-3 rounded-2xl font-serif text-base transition-all duration-300",
            "bg-white/20 border border-white/30 text-white",
            "hover:bg-white/25 disabled:opacity-40 disabled:hover:bg-white/20"
          )}
        >
          {saving ? "Saving…" : "Save Reflection"}
        </button>
      </div>
    </div>
  );
}
