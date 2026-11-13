import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHead } from "@/components/layout/PageHead";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/config";

function SettingsRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-5 py-4 text-left text-base text-[color:var(--th-ink)] transition-colors hover:bg-white/50"
    >
      {label}
      <ChevronRight size={16} className="text-[color:var(--th-text-3)]" />
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

  const group = "th-glass mb-4 divide-y divide-[color:var(--th-line)] overflow-hidden";

  return (
    <AppShell onBack={() => navigate("/home")} actions={<span />}>
      <div className="mx-auto max-w-sm pb-4">
        <PageHead title="Settings" />

        {/* Profile */}
        <div className={group}>
          <div className="px-5 py-4">
            <p className="th-label mb-1">Name</p>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameValue}
                  aria-label="Name"
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="th-field flex-1 py-2"
                />
                <button type="button" onClick={handleSaveName} disabled={saving} className="th-btn px-4 py-2 text-sm">
                  {saving ? "…" : "Save"}
                </button>
                <button type="button" onClick={() => setEditingName(false)} className="th-text-link">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-base">{displayName}</p>
                <button type="button" onClick={() => setEditingName(true)} className="th-text-link">
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className="px-5 py-4">
            <p className="th-label mb-1">Username</p>
            <p className="text-base text-[color:var(--th-text-2)]">
              {username ? `@${username}` : <span className="italic text-[color:var(--th-text-3)]">not set</span>}
            </p>
          </div>
        </div>

        {/* Your profile and safety */}
        <div className={group}>
          <SettingsRow label="Edit what you've shared" onClick={() => navigate("/settings/profile")} />
          <SettingsRow label="Blocked people" onClick={() => navigate("/settings/blocked")} />
        </div>

        {/* Help and policies */}
        <div className={group}>
          <SettingsRow label="Need support right now?" onClick={() => navigate("/crisis")} />
          <SettingsRow label="Help and contact" onClick={() => navigate("/support")} />
          <SettingsRow label="Terms of Use" onClick={() => navigate("/terms")} />
          <SettingsRow label="Privacy Policy" onClick={() => navigate("/privacy")} />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="th-glass mb-4 w-full px-5 py-4 text-left text-base transition-colors hover:bg-white/90"
        >
          Sign out
        </button>

        {/* Delete account */}
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="th-on-sky w-full px-5 py-3 text-center text-sm opacity-90 hover:opacity-100"
          >
            Delete account
          </button>
        ) : (
          <div className="th-glass px-5 py-5 text-center">
            <p className="th-sub mb-4 leading-relaxed">
              This permanently deletes your account and all your data. There's no undo.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="th-text-link px-4 py-2">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="rounded-full bg-[#9b4a3c] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
