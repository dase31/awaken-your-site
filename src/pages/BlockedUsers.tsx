import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHead } from "@/components/layout/PageHead";
import { PersonAvatar } from "@/components/PersonAvatar";
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
    <AppShell onBack={() => navigate("/settings")} actions={<span />}>
      <div className="mx-auto max-w-md">
        <PageHead title="Blocked people" sub="They can't see you or message you." />

        {loading ? (
          <div className="th-glass-row h-16 animate-pulse motion-reduce:animate-none" />
        ) : people.length === 0 ? (
          <div className="th-glass px-6 py-10 text-center">
            <p className="th-display text-[1.15rem]">You haven't blocked anyone.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {people.map((p) => (
              <div key={p.id} className="th-glass flex items-center gap-4 p-4">
                <PersonAvatar name={p.name} size={44} />
                <p className="th-display min-w-0 flex-1 truncate text-base">{p.name}</p>
                <button type="button" onClick={() => handleUnblock(p.id)} className="th-pill th-chip">
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
