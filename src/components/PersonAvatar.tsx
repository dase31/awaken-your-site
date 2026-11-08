import { cn } from "@/lib/utils";

// Three earthy tones from the palette, picked by name so a person keeps the
// same colour everywhere they appear.
const TONES = ["var(--th-sage)", "var(--th-umber-light)", "var(--th-sky-deep)"];

function toneFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

export function PersonAvatar({ name, size = 44, className }: { name: string; size?: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("th-display rounded-full flex items-center justify-center shrink-0 text-white font-medium", className)}
      style={{ width: size, height: size, background: toneFor(name || "?"), fontSize: size * 0.36 }}
    >
      {name ? name.charAt(0).toUpperCase() : ""}
    </div>
  );
}
