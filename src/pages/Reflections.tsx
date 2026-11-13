import { AppShell } from "@/components/layout/AppShell";
import { PageHead } from "@/components/layout/PageHead";
import { BookIcon } from "@/components/icons/ThymosIcons";
import { useReflections } from "@/hooks/useReflections";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const Reflections = () => {
  const navigate = useNavigate();
  const { reflections, loading } = useReflections();

  return (
    <AppShell onBack={() => navigate("/home")}>
      <div className="mx-auto max-w-md">
        <PageHead title="Past reflections" sub="What you've written down." />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="th-glass-row h-24 animate-pulse motion-reduce:animate-none" />
            ))}
          </div>
        ) : reflections.length === 0 ? (
          <div className="th-glass px-6 py-10 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "#E9E2D4" }}
            >
              <BookIcon width={28} height={28} />
            </div>
            <p className="th-display text-[1.2rem]">No reflections yet.</p>
            <p className="th-sub mt-2">Tap "Today's reflection" on your home screen to begin.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reflections.map((r) => (
              <div key={r.id} className="th-glass p-5">
                <p className="th-label mb-2">{format(new Date(r.createdAt), "MMM d, yyyy")}</p>
                <p className="th-display mb-3 text-[0.98rem] italic text-[color:var(--th-umber-light)]">
                  "{r.prompt}"
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--th-ink)]">{r.response}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Reflections;
