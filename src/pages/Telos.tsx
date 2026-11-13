import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useTelosProfile } from "@/hooks/useTelosProfile";
import { useTelosPosts, TelosPost } from "@/hooks/useTelosPosts";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Plus, X, ArrowRight } from "lucide-react";
import { PageHead } from "@/components/layout/PageHead";
import { PersonAvatar } from "@/components/PersonAvatar";
import { SunIcon, AskIcon, TreeArt } from "@/components/icons/ThymosIcons";
import { SafetyMenu } from "@/components/safety/SafetyMenu";

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
function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("th-glass p-5", className)}>{children}</div>;
}

// ── First-visit Intro ──
const TELOS_STEPS = [
  {
    title: "Share what you're good at",
    body: "Pick the areas you know something about.",
  },
  {
    title: "Offer help, or ask for it",
    body: "Post what you can give — or what you need.",
  },
  {
    title: "Someone responds",
    body: "A reply opens a conversation between you.",
  },
];

function TelosIntro({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fade-in-up">
      <PageHead title="Telos" sub="The part of Thymos where you give, not just receive." />

      <div className="space-y-2.5 mb-6">
        {TELOS_STEPS.map((step, i) => (
          <GlassCard key={step.title} className="flex gap-4 items-start !py-4">
            <span className="th-display text-[var(--th-umber-light)] text-xl leading-none pt-0.5 shrink-0">
              {i + 1}
            </span>
            <div>
              <p className="text-[var(--th-ink)] text-[0.95rem] font-medium mb-0.5">{step.title}</p>
              <p className="text-[var(--th-text-2)] text-sm leading-relaxed">{step.body}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <button onClick={onContinue} className="th-btn w-full">
        Set up my Telos →
      </button>
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
    <div className="space-y-3 fade-in-up">
      <PageHead title="Set up your Telos" sub="Share what you can offer. Your skills become a force for good." />

      <GlassCard>
        <h2 className="th-eyebrow mb-3">Your specialties</h2>
        <div className="flex flex-wrap gap-2">
          {SPECIALTY_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => toggle(s)}
              aria-pressed={selected.includes(s)}
              className="th-pill !bg-[var(--th-paper)] !border-[var(--th-line)] aria-pressed:!bg-[var(--th-ink)]"
            >
              {s}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="th-eyebrow mb-3">Brief description</h2>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What drives you? How do you want to contribute?"
          className="th-field resize-none min-h-[80px]"
          rows={3}
        />
      </GlassCard>

      <button
        onClick={handleSave}
        disabled={selected.length === 0 || saving}
        className="th-btn w-full !mt-5"
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

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[rgba(28,27,24,0.35)] backdrop-blur-sm px-4"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      role="dialog"
      aria-modal="true"
      aria-label="New post"
      onClick={onClose}
    >
      <div
        className="th-sheet w-full max-w-md max-h-[85dvh] overflow-y-auto p-6 space-y-4 fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="th-display text-[1.3rem] text-[var(--th-ink)]">New post</h2>
          <button onClick={onClose} aria-label="Close" className="text-[var(--th-text-2)] hover:text-[var(--th-ink)] p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          {(["offer", "need"] as const).map(t => (
            <button
              key={t}
              onClick={() => setPostType(t)}
              aria-pressed={postType === t}
              className="th-pill flex-1 !py-2.5 !bg-[var(--th-paper)] !border-[var(--th-line)] aria-pressed:!bg-[var(--th-ink)]"
            >
              {t === "offer" ? "I'm offering" : "I need help"}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What are you offering or need?"
          className="th-field"
        />

        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Describe in more detail…"
          className="th-field resize-none"
          rows={3}
        />

        <div>
          <label className="th-label mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className="th-pill !text-xs !py-1.5 !px-3 !bg-[var(--th-paper)] !border-[var(--th-line)] aria-pressed:!bg-[var(--th-ink)]"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!title.trim() || !desc.trim() || saving}
          className="th-btn w-full"
        >
          {saving ? "Posting…" : "Post"}
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── Post Card ──
function PostCard({ post, isOwn, onRespond, onBlocked }: { post: TelosPost; isOwn: boolean; onRespond: () => void; onBlocked: () => void }) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const isOffer = post.post_type === "offer";

  return (
    <GlassCard className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <PersonAvatar name={post.author_name ?? ""} size={34} />
          <div className="min-w-0">
            <p className="text-[var(--th-ink)] text-sm font-medium truncate">{post.author_name}</p>
            <p className="text-[var(--th-text-3)] text-xs">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              isOffer
                ? "bg-[#E4E7DB] text-[var(--th-sage-deep)]"
                : "bg-[#E9E2D4] text-[var(--th-umber-light)]"
            )}
          >
            {isOffer ? <SunIcon width={12} height={12} color="currentColor" /> : <AskIcon width={12} height={12} />}
            {isOffer ? "Offering" : "Needs help"}
          </span>
          {!isOwn && (
            <SafetyMenu
              className="-mr-2 !w-8 !h-8"
              targetUserId={post.user_id}
              targetName={post.author_name || "this person"}
              telosPostId={post.id}
              getContext={() => `${post.title}\n${post.description}`}
              onBlocked={onBlocked}
            />
          )}
        </div>
      </div>

      <div>
        <h3 className="text-[var(--th-ink)] font-medium text-base mb-1">{post.title}</h3>
        <p className="text-[var(--th-text-2)] text-sm leading-relaxed">{post.description}</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[var(--th-text-2)] text-xs bg-black/5 px-2.5 py-1 rounded-full">{post.category}</span>
        {!isOwn && (
          <button
            onClick={onRespond}
            className="flex items-center gap-1 text-[var(--th-ink)] text-sm font-medium"
          >
            Respond <ArrowRight size={14} />
          </button>
        )}
      </div>

      {post.author_specialties && post.author_specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--th-line)]">
          {post.author_specialties.map(s => (
            <span key={s} className="text-[var(--th-text-3)] text-xs bg-black/[0.04] px-2 py-0.5 rounded-full">{s}</span>
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
  const { posts, loading: postsLoading, userId, createPost, startTelosChat, refetch } = useTelosPosts();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "offer" | "need">("all");
  const [introDone, setIntroDone] = useState(false);

  const filteredPosts = filter === "all" ? posts : posts.filter(p => p.post_type === filter);

  const handleRespond = async (post: TelosPost) => {
    const convoId = await startTelosChat(post.user_id);
    if (convoId) navigate(`/chat/${convoId}`);
  };

  if (profileLoading) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto space-y-2.5 pt-4">
          {[1, 2, 3].map(i => <div key={i} className="th-glass-row h-24 animate-pulse" />)}
        </div>
      </AppShell>
    );
  }

  // No telos profile yet — explain Telos first, then show setup
  if (!profile) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto">
          {introDone ? (
            <TelosProfileSetup onSave={saveProfile} />
          ) : (
            <TelosIntro onContinue={() => setIntroDone(true)} />
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-md mx-auto">
        <PageHead
          title="Telos"
          sub="Purpose in action — offer something, or ask."
          right={
            <button
              onClick={() => setShowCreateModal(true)}
              aria-label="New post"
              className="th-icon-btn shrink-0"
            >
              <Plus size={20} />
            </button>
          }
        />

        <div className="flex gap-2 px-1 pb-4">
          {(["all", "offer", "need"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className="th-pill"
            >
              {f === "all" ? "All" : f === "offer" ? "Offerings" : "Requests"}
            </button>
          ))}
        </div>

        {postsLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map(i => <div key={i} className="th-glass h-32 animate-pulse" />)}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-2.5">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                isOwn={post.user_id === userId}
                onRespond={() => handleRespond(post)}
                onBlocked={refetch}
              />
            ))}
          </div>
        ) : (
          <GlassCard className="text-center !px-7 !pt-9 !pb-8">
            <TreeArt className="w-[92px] h-[92px] mx-auto mb-4" />
            <h3 className="th-display text-[1.2rem] font-medium text-[var(--th-ink)] mb-2">
              {filter === "all" ? "No posts yet" : filter === "offer" ? "No offerings yet" : "No requests yet"}
            </h3>
            <p className="text-[var(--th-text-2)] text-[0.86rem] leading-relaxed mb-5">
              Be the first to contribute — share what you can offer, or ask for help.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-block text-[0.86rem] font-semibold text-[var(--th-ink)] bg-[var(--th-paper)] border border-[var(--th-line)] px-[18px] py-[9px] rounded-full"
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
