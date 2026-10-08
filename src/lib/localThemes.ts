// Turns free text from the "add your own" boxes into the same tags the
// preset buttons produce, using plain keyword rules that run on the device.
//
// This replaced an AI call. Nothing typed here leaves the phone, which
// matters because people write about their mental health in these boxes.
// It is deliberately simple: it only needs to catch the obvious cases, and
// the preset buttons are always there for everything else.

import {
  PRESET_STRUGGLES,
  PRESET_GOALS,
  PRESET_INTENTS,
  tagId,
} from "@/lib/onboardingOptions";

export type ThemeKind = "struggles" | "strengths" | "goals" | "connection_intent";

export interface LocalTag {
  id: string;
  label: string;
  confidence: number;
}

export interface LocalThemes {
  themes: string[];
  context: string;
  suggested_tags: LocalTag[];
}

type Rule = { label: string; pattern: RegExp };

const STRUGGLE_RULES: Rule[] = [
  { label: "Anxiety", pattern: /anxi|panic|worr(y|ied|ies)|nervous|on edge|racing thoughts|dread/i },
  { label: "Loneliness", pattern: /lonel|\balone\b|isolat|nobody|no one (to talk|understands|gets)|disconnect/i },
  { label: "Self-doubt", pattern: /self.?doubt|not good enough|imposter|insecure|inadequate|worthless|second.?guess/i },
  { label: "Burnout", pattern: /burn(t|ed)?[ -]?out|exhaust|drained|running on empty/i },
  { label: "Grief", pattern: /\bgrie|passed away|\bdied\b|\bdeath\b|bereave|mourn|lost (my|a) (mom|mum|dad|father|mother|friend|partner|brother|sister|child|pet)/i },
  { label: "Relationship struggles", pattern: /relationship|break.?up|divorce|\bpartner\b|marriage|\bex\b|cheat|toxic|family (conflict|issues)/i },
  { label: "Identity", pattern: /identity|who am i|lost myself|don.?t know who|figuring out who|belong/i },
  { label: "Depression", pattern: /depress|hopeless|\bnumb\b|empty inside|no energy|can.?t get out of bed/i },
  { label: "Overwhelm", pattern: /overwhelm|too much|can.?t cope|stretched|swamped|drowning/i },
  { label: "Anger", pattern: /\bang(ry|er)\b|\brage\b|furious|resent|irritab|frustrat/i },
];

const GOAL_RULES: Rule[] = [
  { label: "Inner peace", pattern: /peace|calm|quiet|serenity|relax/i },
  { label: "Confidence", pattern: /confiden|believe in myself|self.?esteem/i },
  { label: "Self-acceptance", pattern: /accept|self.?love|love myself|kind to myself/i },
  { label: "Better boundaries", pattern: /boundar|say no|people.?pleas/i },
  { label: "Emotional awareness", pattern: /emotion|understand myself|self.?aware/i },
  { label: "Resilience", pattern: /resilien|bounce back|stronger|recover/i },
  { label: "Purpose", pattern: /purpose|meaning|direction|calling|passion/i },
  { label: "Patience", pattern: /patien/i },
  { label: "Letting go", pattern: /let(ting)? go|move on|release|forgive/i },
  { label: "Vulnerability", pattern: /vulnerab|open up|be honest|express myself/i },
];

const INTENT_RULES: Rule[] = [
  { label: "A listener", pattern: /listen|be heard|hear me|someone to talk|vent/i },
  { label: "Mutual support", pattern: /mutual|support each other|two.?way|both of us|reciprocal/i },
  { label: "Accountability partner", pattern: /accountab|check.?in|keep me on track|consisten/i },
  { label: "Someone who gets it", pattern: /gets? it|been through|similar|relate|same boat|understand/i },
  { label: "Honest conversations", pattern: /honest|real talk|authentic|genuine|deep conversation/i },
  { label: "Growth together", pattern: /grow|improve|progress|journey|better version/i },
  { label: "Non-judgmental space", pattern: /judg|safe space|safe place/i },
  { label: "Shared experiences", pattern: /shared|someone who.?s (been|gone)|survivor/i },
];

const MAX_TAGS = 4;

function match(text: string, rules: Rule[]): LocalTag[] {
  const tags: LocalTag[] = [];
  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      tags.push({ id: tagId(rule.label), label: rule.label, confidence: 0.8 });
    }
    if (tags.length >= MAX_TAGS) break;
  }
  return tags;
}

export function extractLocalThemes(text: string, kind: ThemeKind): LocalThemes {
  // Make sure every rule label is a real preset so ids line up with what the
  // buttons produce — a typo here would silently split people who match.
  const rules =
    kind === "goals" ? GOAL_RULES
    : kind === "connection_intent" ? INTENT_RULES
    : kind === "struggles" ? STRUGGLE_RULES
    : [];

  const tags = match(text, rules);
  return { themes: tags.map((t) => t.id), context: "", suggested_tags: tags };
}

// Dev-time guard: every rule must map to a preset label.
if (import.meta.env.DEV) {
  const known = new Set([...PRESET_STRUGGLES, ...PRESET_GOALS, ...PRESET_INTENTS]);
  for (const r of [...STRUGGLE_RULES, ...GOAL_RULES, ...INTENT_RULES]) {
    if (!known.has(r.label)) console.warn(`localThemes: "${r.label}" is not a preset label`);
  }
}
