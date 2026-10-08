import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/config";

function SettingsRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 text-left text-white text-base hover:bg-white/10 transition-colors"
    >
      {label}
      <ChevronRight size={16} className="text-white/35" />
    </button>
  );
}

const Settings = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, username")
        .eq("id", session.user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name);
        setUsername(data.username || "");
        setNameValue(data.display_name);
      }
    };
    load();
  }, []);

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === displayName) { setEditingName(false); return; }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", session.user.id);
    setSaving(false);
    if (error) { toast.error("Couldn't save name."); return; }
    setDisplayName(trimmed);
    setEditingName(false);
    toast.success("Name updated.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Removes the login itself, not just the profile row; everything that
    // belongs to the account goes with it.
    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      console.error("Error deleting account:", error);
      toast.error(`Couldn't delete your account. Please email ${SUPPORT_EMAIL}.`);
      setDeleting(false);
      return;
    }
    try { localStorage.removeItem("thymos_reflections"); } catch { /* ignore */ }
    // The account no longer exists server-side, so only clear this device.
    await supabase.auth.signOut({ scope: "local" });
    navigate("/", { replace: true });
  };

  return (
    <AppShell>
      <div className="max-w-sm mx-auto pt-4 pb-8">
        <h2
          className="font-serif text-white text-3xl mb-10 text-center"
          style={{ textShadow: "0 2px 16px rgba(0,60,120,0.2)" }}
        >
          Settings
        </h2>

        {/* Profile section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden mb-4">
          {/* Display name */}
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Name</p>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                  className="flex-1 bg-transparent text-white text-base border-b border-white/40 focus:outline-none focus:border-white/80 py-0.5 transition-colors"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="text-white/60 text-sm hover:text-white transition-colors"
                >
                  {saving ? "…" : "Save"}
                </button>
                <button onClick={() => setEditingName(false)} className="text-white/40 text-sm hover:text-white/60 transition-colors">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-white text-base">{displayName}</p>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-white/40 text-xs hover:text-white/70 transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Username */}
          <div className="px-5 py-4">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Username</p>
            <p className="text-white/70 text-base">
              {username ? `@${username}` : <span className="text-white/30 italic">not set</span>}
            </p>
          </div>
        </div>

        {/* Your profile and safety */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden mb-4 divide-y divide-white/10">
          <SettingsRow label="Edit what you've shared" onClick={() => navigate("/settings/profile")} />
          <SettingsRow label="Blocked people" onClick={() => navigate("/settings/blocked")} />
        </div>

        {/* Help and policies */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden mb-4 divide-y divide-white/10">
          <SettingsRow label="Need support right now?" onClick={() => navigate("/crisis")} />
          <SettingsRow label="Help and contact" onClick={() => navigate("/support")} />
          <SettingsRow label="Terms of Use" onClick={() => navigate("/terms")} />
          <SettingsRow label="Privacy Policy" onClick={() => navigate("/privacy")} />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-white text-base text-left hover:bg-white/15 transition-colors mb-4"
        >
          Sign out
        </button>

        {/* Delete account */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-5 py-3 text-white/30 text-sm hover:text-red-300 transition-colors text-center"
          >
            Delete account
          </button>
        ) : (
          <div className="bg-white/5 border border-red-400/20 rounded-2xl px-5 py-4 text-center">
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
              This permanently deletes your account and all your data. There's no undo.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-white/50 text-sm hover:text-white/70 transition-colors px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-400/20 border border-red-400/30 text-red-300 text-sm px-4 py-2 rounded-full hover:bg-red-400/30 transition-colors"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Settings;
