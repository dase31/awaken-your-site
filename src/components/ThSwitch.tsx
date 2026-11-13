import { cn } from "@/lib/utils";

// A pill switch in the brand palette: ink when on, soft glass when off.
export function ThSwitch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full border transition-colors disabled:opacity-50",
        checked ? "border-[color:var(--th-ink)] bg-[color:var(--th-ink)]" : "border-[color:var(--th-line)] bg-[rgba(28,27,24,0.12)]"
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-0.5 h-[22px] w-[22px] rounded-full bg-[color:var(--th-paper)] shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
