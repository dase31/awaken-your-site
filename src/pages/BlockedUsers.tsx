import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { fetchMyBlockedIds, unblockUser } from "@/lib/blocks";

interface BlockedPerson {
  id: string;
  name: string;
}

const BlockedUsers = () => {
  const navigate = useNavigate();
  const [people, setPeople] = useState<BlockedPerson[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const ids = await fetchMyBlockedIds();
    if (ids.length === 0) {
      setPeople([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("profiles").select("id, display_name").in("id", ids);
    const names = new Map((data ?? []).map((p) => [p.id, p.display_name]));
    setPeople(ids.map((id) => ({ id, name: names.get(id) ?? "Unknown" })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUnblock = async (id: string) => {
    const ok = await unblockUser(id);
    if (!ok) { toast.error("Couldn't unblock. Please try again."); return; }
    toast.success("Unblocked.");
    load();
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/settings")}
            aria-label="Back to settings"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition-all"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1
            className="font-serif text-white text-2xl"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
          >
            Blocked people
          </h1>
        </div>

        {loading ? (
          <div className="h-16 bg-white/10 rounded-2xl animate-pulse" />
        ) : people.length === 0 ? (
          <p className="text-white/60 text-base text-center py-12">
            You haven't blocked anyone.
          </p>
        ) : (
          <div className="space-y-3">
            {people.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl"
              >
                <div className="w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <span className="font-serif text-white text-lg">{p.name.charAt(0).toUpperCase()}</span>
                </div>
                <p className="font-serif text-white text-base flex-1 truncate">{p.name}</p>
                <button
                  onClick={() => handleUnblock(p.id)}
                  className="text-white/80 text-sm px-4 py-1.5 rounded-full border border-white/30 hover:bg-white/15 transition-colors"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default BlockedUsers;
