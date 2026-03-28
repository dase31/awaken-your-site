import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useTelosProfile } from "@/hooks/useTelosProfile";
import { useTelosPosts, TelosPost } from "@/hooks/useTelosPosts";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Plus, X, Heart, HandHelping, ArrowRight } from "lucide-react";

const SPECIALTY_OPTIONS = [
  "Design", "Writing", "Marketing", "Engineering", "Teaching",
  "Counseling", "Photography", "Music", "Finance", "Legal",
  "Health & Wellness", "Community Building", "Data & Analytics", "Strategy",
];

const CATEGORY_OPTIONS = [
  "NGO / Nonprofit", "Community", "Education", "Health",
  "Environment", "Creative Arts", "Tech for Good", "Mentorship", "Other",
];

// ── Glass Card ──
function GlassCard({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-5 shadow-lg shadow-black/5",
        "transition-all duration-300",
        onClick && "cursor-pointer hover:bg-white/25 active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Profile Setup ──
function TelosProfileSetup({ onSave }: { onSave: (desc: string, specs: string[]) => void }) {
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (s: string) =>
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    await onSave(description, selected);
    setSaving(false);
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="text-center mb-4">
        <h1
          className="font-serif text-white text-2xl md:text-3xl mb-2"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
        >
          Set up your Telos
        </h1>
        <p className="text-white/70 text-sm max-w-xs mx-auto">
          Share what you can offer the world. Your skills become a force for good.
        </p>
      </div>

      <GlassCard>
        <h2 className="text-white/80 text-sm uppercase tracking-wide mb-3 font-medium">
          Your Specialties
        </h2>
        <div className="flex flex-wrap gap-2">
          {SPECIALTY_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => toggle(s)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-all duration-200 border",
                selected.includes(s)
                  ? "bg-white/30 border-white/50 text-white font-medium"
                  : "bg-white/10 border-white/20 text-white/70 hover:bg-white/15"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-white/80 text-sm uppercase tracking-wide mb-3 font-medium">
          Brief Description
        </h2>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What drives you? How do you want to contribute?"
          className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder:text-white/40 text-sm resize-none focus:outline-none focus:border-white/40 min-h-[80px]"
          rows={3}
        />
      </GlassCard>

      <button
        onClick={handleSave}
        disabled={selected.length === 0 || saving}
        className={cn(
          "w-full py-3 rounded-2xl font-medium text-sm transition-all duration-300",
          selected.length > 0
            ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/25 active:scale-[0.98]"
            : "bg-white/10 border border-white/15 text-white/40 cursor-not-allowed"
        )}
      >
        {saving ? "Saving…" : "Activate Telos"}
      </button>
    </div>
  );
}

// ── Create Post Modal ──
function CreatePostModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (title: string, desc: string, type: string, category: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [postType, setPostType] = useState<"offer" | "need">("offer");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !desc.trim()) return;
    setSaving(true);
    await onCreate(title, desc, postType, category);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[hsl(200,60%,40%)]/95 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto space-y-4 fade-in-up">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-white text-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            New Post
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2">
          {(["offer", "need"] as const).map(t => (
            <button
              key={t}
              onClick={() => setPostType(t)}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-medium transition-all border",
                postType === t
                  ? "bg-white/25 border-white/40 text-white"
                  : "bg-white/10 border-white/15 text-white/60 hover:bg-white/15"
              )}
            >
              {t === "offer" ? "I'm Offering" : "I Need Help"}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What are you offering or need?"
          className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/40"
        />

        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Describe in more detail…"
          className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder:text-white/40 text-sm resize-none focus:outline-none focus:border-white/40"
          rows={3}
        />

        {/* Category */}
        <div>
          <label className="text-white/70 text-xs uppercase tracking-wide mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs transition-all border",
                  category === c
                    ? "bg-white/25 border-white/40 text-white"
                    : "bg-white/10 border-white/15 text-white/60"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!title.trim() || !desc.trim() || saving}
          className={cn(
            "w-full py-3 rounded-2xl font-medium text-sm transition-all duration-300",
            title.trim() && desc.trim()
              ? "bg-white/20 border border-white/30 text-white hover:bg-white/25 active:scale-[0.98]"
              : "bg-white/10 border border-white/15 text-white/40 cursor-not-allowed"
          )}
        >
          {saving ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}

// ── Post Card ──
function PostCard({ post, isOwn, onRespond }: { post: TelosPost; isOwn: boolean; onRespond: () => void }) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const isOffer = post.post_type === "offer";

  return (
    <GlassCard className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
            <span className="font-serif text-white text-sm">{post.author_name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{post.author_name}</p>
            <p className="text-white/50 text-xs">{timeAgo}</p>
          </div>
        </div>
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium border",
          isOffer
            ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
            : "bg-amber-500/20 border-amber-400/30 text-amber-200"
        )}>
          {isOffer ? <><Heart size={10} className="inline mr-1" />Offering</> : <><HandHelping size={10} className="inline mr-1" />Needs Help</>}
        </span>
      </div>

      <div>
        <h3 className="text-white font-medium text-base mb-1" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
          {post.title}
        </h3>
        <p className="text-white/70 text-sm">{post.description}</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white/50 text-xs bg-white/10 px-2 py-0.5 rounded-full">{post.category}</span>
        {!isOwn && (
          <button
            onClick={onRespond}
            className="flex items-center gap-1 text-white/80 text-sm font-medium hover:text-white transition-colors"
          >
            Respond <ArrowRight size={14} />
          </button>
        )}
      </div>

      {post.author_specialties && post.author_specialties.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1 border-t border-white/10">
          {post.author_specialties.map(s => (
            <span key={s} className="text-white/50 text-xs bg-white/5 px-2 py-0.5 rounded-full">{s}</span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// ── Main Page ──
const Telos = () => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, saveProfile } = useTelosProfile();
  const { posts, loading: postsLoading, userId, createPost, startTelosChat } = useTelosPosts();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "offer" | "need">("all");

  const filteredPosts = filter === "all" ? posts : posts.filter(p => p.post_type === filter);

  const handleRespond = async (post: TelosPost) => {
    const convoId = await startTelosChat(post.user_id);
    if (convoId) navigate(`/chat/${convoId}`);
  };

  if (profileLoading) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/10 rounded-2xl animate-pulse" />)}
        </div>
      </AppShell>
    );
  }

  // No telos profile yet — show setup
  if (!profile) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto">
          <TelosProfileSetup onSave={saveProfile} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-md mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-serif text-white text-2xl"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
            >
              Telos
            </h1>
            <p className="text-white/60 text-sm">Purpose in action</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["all", "offer", "need"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                filter === f
                  ? "bg-white/25 border-white/40 text-white"
                  : "bg-white/10 border-white/15 text-white/60 hover:bg-white/15"
              )}
            >
              {f === "all" ? "All" : f === "offer" ? "Offerings" : "Requests"}
            </button>
          ))}
        </div>

        {/* Posts feed */}
        {postsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/10 rounded-2xl animate-pulse" />)}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-3">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                isOwn={post.user_id === userId}
                onRespond={() => handleRespond(post)}
              />
            ))}
          </div>
        ) : (
          <GlassCard className="text-center py-10">
            <p className="font-serif text-white/70 text-lg mb-2" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              {filter === "all" ? "No posts yet" : filter === "offer" ? "No offerings yet" : "No requests yet"}
            </p>
            <p className="text-white/50 text-sm mb-4">
              Be the first to contribute — share what you can offer or ask for help.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-white/80 text-sm font-medium hover:text-white transition-colors"
            >
              Create a post →
            </button>
          </GlassCard>
        )}
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createPost}
        />
      )}
    </AppShell>
  );
};

export default Telos;
