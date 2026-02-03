import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function EmptyMatchState() {
  const navigate = useNavigate();

  return (
    <div className="fade-in-up text-center px-6 max-w-md w-full">
      <h1
        className="font-serif text-foreground text-3xl md:text-4xl leading-relaxed mb-4"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
      >
        You're among the first
      </h1>

      <p
        className="font-serif text-foreground/70 text-lg md:text-xl leading-relaxed mb-8"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
      >
        We're building your network. We'll let you know when someone resonates.
      </p>

      <button
        onClick={() => navigate("/home")}
        className={cn(
          "px-8 py-3 rounded-full font-serif text-lg transition-all duration-300",
          "bg-white/20 border border-white/50 text-primary",
          "hover:bg-white/30 hover:scale-[1.02] focus:outline-none"
        )}
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
      >
        Continue to Home
      </button>
    </div>
  );
}
