import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { PageHead } from "@/components/layout/PageHead";
import { ThemeTag } from "@/components/onboarding/ThemeTag";
import {
  PRESET_STRUGGLES,
  PRESET_GOALS,
  PRESET_INTENTS,
  PRESET_OFFERS,
  CAPACITY_LEVELS,
  QUOTE_MAX_LENGTH,
  tagId,
  tagLabel,
} from "@/lib/onboardingOptions";

type TagTable = "user_struggles" | "user_goals" | "user_connection_intents" | "user_offers";
type TagColumn = "struggle_type" | "goal_type" | "intent_type" | "offer_type";

interface Category {
  key: "struggles" | "goals" | "intents" | "offers";
  title: string;
  hint: string;
  presets: string[];
  table: TagTable;
  column: TagColumn;
  // Offers are stored by their label; the others by an id derived from it.
  byLabel?: boolean;
}

// The generated client types make a query on a table chosen at runtime too
// deep to check, so describe just the two calls this page makes.
type TagQuery = {
  insert(rows: object[]): Promise<{ error: Error | null }>;
  delete(): { eq(col: string, val: string): { in(col: string, vals: string[]): Promise<{ error: Error | null }> } };
};
const tagTable = (table: TagTable) => supabase.from(table) as unknown as TagQuery;

const CATEGORIES: Category[] = [
  { key: "struggles", title: "What's been weighing on you", hint: "Matching works best with at least one.", presets: PRESET_STRUGGLES, table: "user_struggles", column: "struggle_type" },
  { key: "goals", title: "What you're reaching toward", hint: "", presets: PRESET_GOALS, table: "user_goals", column: "goal_type" },
  { key: "intents", title: "The connection you're hoping for", hint: "", presets: PRESET_INTENTS, table: "user_connection_intents", column: "intent_type" },
  { key: "offers", title: "What you can offer", hint: "", presets: PRESET_OFFERS, table: "user_offers", column: "offer_type", byLabel: true },
];

type Selections = Record<Category["key"], string[]>;
const EMPTY: Selections = { struggles: [], goals: [], intents: [], offers: [] };

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // `original` is what's in the database; `selected` is what's on screen.
  const [original, setOriginal] = useState<Selections>(EMPTY);
  const [selected, setSelected] = useState<Selections>(EMPTY);
  const [capacity, setCapacity] = useState("");
  const [originalCapacity, setOriginalCapacity] = useState("");
  const [quote, setQuote] = useState("");
  const [originalQuote, setOriginalQuote] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;
      setUserId(uid);

      const [struggles, goals, intents, offers, profile] = await Promise.all([
        supabase.from("user_struggles").select("struggle_type").eq("user_id", uid),
        supabase.from("user_goals").select("goal_type").eq("user_id", uid),
        supabase.from("user_connection_intents").select("intent_type").eq("user_id", uid),
        supabase.from("user_offers").select("offer_type").eq("user_id", uid),
        supabase.from("profiles").select("capacity_level, quote_text").eq("id", uid).maybeSingle(),
      ]);

      const loaded: Selections = {
        struggles: (struggles.data ?? []).map((r) => r.struggle_type),
        goals: (goals.data ?? []).map((r) => r.goal_type),
        intents: (intents.data ?? []).map((r) => r.intent_type),
        offers: (offers.data ?? []).map((r) => r.offer_type),
      };
      setOriginal(loaded);
      setSelected(loaded);
      setCapacity(profile.data?.capacity_level ?? "");
      setOriginalCapacity(profile.data?.capacity_level ?? "");
      setQuote(profile.data?.quote_text ?? "");
      setOriginalQuote(profile.data?.quote_text ?? "");
      setLoading(false);
    };
    load();
  }, []);

  const toggle = (key: Category["key"], value: string) =>
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));

  const dirty = useMemo(() => {
    const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));
    return (
      CATEGORIES.some((c) => !sameSet(original[c.key], selected[c.key])) ||
      capacity !== originalCapacity ||
      quote.trim() !== originalQuote.trim()
    );
  }, [original, selected, capacity, originalCapacity, quote, originalQuote]);

  const save = async () => {
    if (!userId || saving || !dirty) return;
    setSaving(true);

    try {
      // Only touch what changed. Deleting everything and re-inserting would
      // lose a whole profile if the second step failed halfway.
      for (const c of CATEGORIES) {
        const added = selected[c.key].filter((v) => !original[c.key].includes(v));
        const removed = original[c.key].filter((v) => !selected[c.key].includes(v));

        if (added.length > 0) {
          const rows = added.map((v) => ({ user_id: userId, [c.column]: v }));
          const { error } = await tagTable(c.table).insert(rows);
          if (error) throw error;
        }
        if (removed.length > 0) {
          const { error } = await tagTable(c.table)
            .delete()
            .eq("user_id", userId)
            .in(c.column, removed);
          if (error) throw error;
        }
      }

      if (capacity !== originalCapacity || quote.trim() !== originalQuote.trim()) {
        const { error } = await supabase
          .from("profiles")
          .update({ capacity_level: capacity || null, quote_text: quote.trim() || null })
          .eq("id", userId);
        if (error) throw error;
      }

      setOriginal(selected);
      setOriginalCapacity(capacity);
      setOriginalQuote(quote);
      toast.success("Saved.");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Couldn't save everything. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const sectionTitle = "th-label mb-1";

  return (
    <AppShell onBack={() => navigate("/settings")} actions={<span />}>
      <div className="mx-auto max-w-md">
        <PageHead title="What you've shared" sub="What matching uses to find your people." />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="th-glass h-28 animate-pulse motion-reduce:animate-none" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {CATEGORIES.map((c) => {
              // Anything stored that isn't a preset (older or custom tags) still
              // shows up, so it can be removed.
              const extras = selected[c.key].filter(
                (v) => !c.presets.some((p) => (c.byLabel ? p : tagId(p)) === v)
              );
              return (
                <section key={c.key} className="th-glass p-5">
                  <h2 className={sectionTitle}>{c.title}</h2>
                  {c.hint && <p className="th-sub mb-3 text-xs">{c.hint}</p>}
                  <div className={`flex flex-wrap gap-2 ${c.hint ? "" : "mt-3"}`}>
                    {c.presets.map((p) => {
                      const value = c.byLabel ? p : tagId(p);
                      return (
                        <ThemeTag
                          key={p}
                          label={p}
                          isSelected={selected[c.key].includes(value)}
                          onClick={() => toggle(c.key, value)}
                        />
                      );
                    })}
                    {extras.map((v) => (
                      <ThemeTag
                        key={v}
                        label={c.byLabel ? v : tagLabel(v, c.presets)}
                        isSelected
                        onClick={() => toggle(c.key, v)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            <section className="th-glass p-5">
              <h2 className={`${sectionTitle} mb-3`}>How much room you have for someone else</h2>
              <div className="flex flex-wrap gap-2">
                {CAPACITY_LEVELS.map((l) => (
                  <ThemeTag
                    key={l.value}
                    label={l.label}
                    isSelected={capacity === l.value}
                    onClick={() => setCapacity(capacity === l.value ? "" : l.value)}
                  />
                ))}
              </div>
            </section>

            <section className="th-glass p-5">
              <h2 className={sectionTitle}>One thing you wish someone understood</h2>
              <p className="th-sub mb-3 text-xs">Shown to people you're matched with.</p>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value.slice(0, QUOTE_MAX_LENGTH))}
                rows={4}
                placeholder="Optional"
                aria-label="One thing you wish someone understood"
                className="th-field resize-none"
              />
              <p className="mt-1 text-right text-xs text-[color:var(--th-text-3)]">
                {quote.length}/{QUOTE_MAX_LENGTH}
              </p>
            </section>

            <button type="button" onClick={save} disabled={!dirty || saving} className="th-btn w-full py-4">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default EditProfile;
