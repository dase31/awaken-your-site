import { cn } from "@/lib/utils";

interface ThemeTagProps {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
}

// A glass chip; ink when selected.
export function ThemeTag({ label, isSelected = false, onClick }: ThemeTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={cn("th-pill th-chip")}
    >
      {label}
    </button>
  );
}
