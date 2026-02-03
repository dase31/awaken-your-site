import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function GlassCard({ children, className, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5",
        "transition-all duration-300",
        onClick && "cursor-pointer hover:bg-white/15 active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}

const Chat = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <h1
          className="font-serif text-foreground text-2xl md:text-3xl mb-6"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
        >
          Messages
        </h1>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p
            className="font-serif text-foreground/70 text-lg mb-2"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
          >
            No conversations yet
          </p>
          <p className="text-foreground/50 text-sm mb-8 max-w-xs">
            When you connect with someone, your conversations will appear here.
          </p>
          
          <GlassCard onClick={() => navigate("/match")} className="w-full">
            <div className="text-center">
              <p
                className="font-serif text-foreground text-base mb-2"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
              >
                Ready to connect?
              </p>
              <span className="inline-flex items-center text-primary font-medium text-sm">
                Find a connection →
              </span>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
};

export default Chat;
