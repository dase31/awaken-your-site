// Shared by onboarding and profile editing so the two can never drift apart.

export const PRESET_STRUGGLES = [
  "Anxiety", "Loneliness", "Self-doubt", "Burnout",
  "Grief", "Relationship struggles", "Identity", "Depression",
  "Overwhelm", "Anger",
];

export const PRESET_GOALS = [
  "Inner peace", "Confidence", "Self-acceptance", "Better boundaries",
  "Emotional awareness", "Resilience", "Purpose", "Patience",
  "Letting go", "Vulnerability",
];

export const PRESET_INTENTS = [
  "A listener", "Mutual support", "Accountability partner",
  "Someone who gets it", "Honest conversations", "Growth together",
  "Non-judgmental space", "Shared experiences",
];

export const PRESET_OFFERS = [
  "Listening", "Empathy", "Shared experience",
  "Encouragement", "Accountability", "I mostly need support right now",
];

export const CAPACITY_LEVELS = [
  { value: "very_little", label: "Very little" },
  { value: "some", label: "Some" },
  { value: "good_amount", label: "A good amount" },
];

export const QUOTE_MAX_LENGTH = 300;

// Tags are stored by id, derived from the label. Keep this the single
// definition so onboarding, editing, and matching all agree.
export const tagId = (label: string): string =>
  label.toLowerCase().replace(/\s+/g, "_");

// Best-effort label for a stored id, including ids that aren't presets
// (anything saved before presets existed).
export const tagLabel = (id: string, presets: string[]): string => {
  const hit = presets.find((p) => tagId(p) === id);
  if (hit) return hit;
  const spaced = id.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};
