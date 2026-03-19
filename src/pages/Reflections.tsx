import { AppShell } from "@/components/layout/AppShell";
import { useReflections } from "@/hooks/useReflections";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Reflections = () => {
  const navigate = useNavigate();
  const { reflections, loading } = useReflections();

  return (
    <AppShell>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition-all"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1
            className="font-serif text-white text-2xl"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
          >
            Past Reflections
          </h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/10 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reflections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/60 text-base">No reflections yet.</p>
            <p className="text-white/40 text-sm mt-2">
              Tap "Today's Reflection" on your home screen to begin.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reflections.map(r => (
              <div
                key={r.id}
                className={cn(
                  "bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5"
                )}
              >
                <p className="text-white/50 text-xs mb-2">
                  {format(new Date(r.createdAt), "MMM d, yyyy")}
                </p>
                <p
                  className="font-serif text-white/70 text-sm italic mb-3"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                >
                  "{r.prompt}"
                </p>
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                  {r.response}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Reflections;
