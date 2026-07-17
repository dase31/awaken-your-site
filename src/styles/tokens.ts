/**
 * Thymos Design System — Single source of truth
 * All design decisions live here. Reference this before adding anything new.
 */

// ─── Typography ───────────────────────────────────────────────────────────────

export const fonts = {
  /** Headlines, questions, display text — all emotional/narrative copy */
  serif: "'Cormorant Garamond', Georgia, serif",
  /** UI elements — labels, buttons, nav, hints */
  sans: "'Inter', system-ui, sans-serif",
} as const;

export const fontSizes = {
  hint:    "0.875rem",   // 14px — "press enter ↵", fine print
  body:    "1rem",       // 16px — base body
  sub:     "1.25rem",    // 20px — subtext, supporting copy
  subLg:   "1.5rem",     // 24px — larger subtext, step questions (mobile)
  step:    "1.875rem",   // 30px — onboarding step headings (mobile)
  stepLg:  "2.25rem",    // 36px — onboarding step headings (desktop)
  hero:    "3rem",       // 48px — hero headline (mobile)
  heroLg:  "3.75rem",    // 60px — hero headline (tablet)
  heroXl:  "4.5rem",     // 72px — hero headline (desktop)
} as const;

export const fontWeights = {
  regular:   "400",
  semibold:  "600",
  bold:      "700",
} as const;

export const lineHeights = {
  tight:   "1.05",   // hero headline
  relaxed: "1.6",    // onboarding questions
  loose:   "1.75",   // body/subtext
} as const;

export const letterSpacing = {
  normal:   "0",
  wide:     "0.05em",
  wider:    "0.12em",
  widest:   "0.3em",   // THYMOS wordmark
} as const;

// ─── Colour ───────────────────────────────────────────────────────────────────

export const colors = {
  sky: {
    light: "hsl(199, 89%, 70%)",   // gradient top
    mid:   "hsl(200, 85%, 60%)",   // gradient middle
    deep:  "hsl(200, 75%, 48%)",   // gradient bottom
  },
  text: {
    primary:   "hsl(0, 0%, 100%)",          // white — main text on sky
    secondary: "rgba(255, 255, 255, 0.70)", // subtext, supporting copy
    muted:     "rgba(255, 255, 255, 0.50)", // hints, continue arrows
    placeholder:"rgba(255, 255, 255, 0.40)",// input placeholders
  },
  gold:  "hsl(45, 95%, 60%)",
  navy:  "hsl(220, 40%, 13%)",
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  /** Main hero headline — depth against bright sky */
  textHero:  "0 2px 24px rgba(0, 60, 120, 0.25), 0 1px 4px rgba(0, 40, 80, 0.15)",
  /** Subtext + onboarding copy — lighter lift */
  textSub:   "0 1px 12px rgba(0, 60, 120, 0.20)",
  /** Inputs and interactive text */
  textInput: "0 2px 10px rgba(0, 0, 0, 0.10)",
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  /** Gap between headline and subtext */
  headlineToSub: "2rem",      // mt-8
  /** Gap between subtext and CTA */
  subToCta:      "3.5rem",    // mt-14
  /** Standard section side padding */
  pagePadding:   "1.5rem",    // px-6
} as const;

// ─── Motion ───────────────────────────────────────────────────────────────────

export const motion = {
  /** Default UI transitions */
  fast:   "150ms ease",
  base:   "300ms ease",
  slow:   "500ms ease-out",
  /** Entry animations (defined in index.css) */
  fadeInUp:      "fadeInUp 0.8s ease-out forwards",
  staggerFadeIn: "fadeInUpStagger 0.5s ease-out forwards",
  stepFadeOut:   "fadeOut 0.3s ease-out forwards",
  /** Stagger delay increment for sequential items */
  staggerStep: 0.15, // seconds
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  pill:   "9999px",  // buttons, tags
  card:   "1rem",    // cards
  input:  "1.5rem",  // text areas (rounded-2xl)
} as const;
