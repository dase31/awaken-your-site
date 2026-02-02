import { cn } from "@/lib/utils";

interface ThemeTagProps {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
  animationDelay?: number;
}

export function ThemeTag({ 
  label, 
  isSelected = false, 
  onClick, 
  animationDelay = 0 
}: ThemeTagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "stagger-fade-in px-5 py-2 rounded-full font-serif text-lg transition-all duration-300",
        "border hover:scale-[1.02] focus:outline-none",
        isSelected
          ? "bg-white/20 border-white/50 text-primary"
          : "border-white/20 text-foreground/80 hover:border-white/40 hover:text-foreground"
      )}
      style={{
        animationDelay: `${animationDelay}s`,
        textShadow: "0 2px 10px rgba(0,0,0,0.15)",
      }}
    >
      {label}
    </button>
  );
}
