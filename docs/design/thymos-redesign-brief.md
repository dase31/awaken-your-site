# Thymos redesign — implementation brief

This is the spec for applying the "manna-nature-design" visual language (warm, cream-and-photography, nature-grounded — the opposite of generic SaaS/dating-app blue glass) to the live Thymos app. It was worked out across two reference builds: an 11-step onboarding flow and the four-tab app shell (Home / Chat / Connect / Telos). Both are attached as static HTML reference files — match them visually screen-for-screen, don't just read the tokens below in the abstract.

If this environment has the `manna-nature-design` skill available, load it — it has the same content as this brief plus the photo-treatment recipe. If not, everything needed to build is below.

## Design tokens

```css
:root{
  --cream:#F7F5F1;        /* primary background */
  --paper:#FCFBF7;        /* cards, inputs, raised surfaces */
  --ink:#1C1B18;          /* primary text, filled buttons */
  --text-2:#59564F;       /* secondary text */
  --text-3:#77756F;       /* tertiary/placeholder text */
  --sky:#7693BB; --sky-deep:#5c7ba3;
  --sage:#909473; --sage-deep:#767a5c;
  --umber:#413521; --umber-light:#7a6a4a;
  --line:rgba(28,27,24,0.1);
  --radius-pill:999px;
  --radius-card:24px;
  --serif:"Fraunces", Georgia, serif;   /* headlines, display type */
  --sans:"Inter", system-ui, -apple-system, sans-serif; /* UI text */
}
```

Headlines: serif, weight 300, letter-spacing -0.02 to -0.03em. UI chrome (buttons, labels, nav): sans, weight 500.

## The core pattern: ambient sky + glass surfaces, app-wide

This is not a per-screen decoration — it's the whole app's visual world. One treated photo (soft, desaturated, warmed — see the attached reference files for the exact image) sits **fixed behind every top-level screen**: every onboarding step and every tab (Home, Chat, Connect, Telos). All actual UI — cards, list rows, chip groups, buttons, inputs — floats on top of it as a frosted glass surface. Nothing in the live app should sit on flat opaque cream anymore; that was the old pattern and it's what we moved away from.

```css
.ambient-sky{
  position:fixed; inset:0; z-index:0;
  background-image:
    linear-gradient(to bottom, rgba(247,245,241,0.2), rgba(247,245,241,0.6)),
    url('/path/to/treated-sky.jpg');
  background-size:cover; background-position:center 30%;
  filter: blur(22px) saturate(1.08);
  transform: scale(1.14); /* avoids transparent edges from the blur */
  pointer-events:none;
}
.glass{
  position:relative; z-index:1;
  background:rgba(252,251,247,0.82);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  backdrop-filter: blur(18px) saturate(150%);
  border-radius:24px; /* 28-32px for a full-screen card/sheet */
  box-shadow:0 20px 40px -18px rgba(28,27,24,0.25), 0 1px 0 rgba(255,255,255,0.5) inset;
}
```

Important implementation detail: `.ambient-sky` must be `position:fixed` **scoped to each screen's own root container** (not scrolling away with the content inside it), so list rows and cards can scroll over a backdrop that stays put — this is what makes Home's Quick Links list, Chat's message list, etc. feel like frosted glass over a window rather than a photo that scrolls with everything else. Scope it to your real app-shell/route-root element, not `body`/`html` directly if your framework re-mounts those between routes.

Reserve one or two screens (onboarding's landing screen, the brand-concept reveal) for the photo at full clarity — no blur — so the ambient/blurred treatment elsewhere still reads as a deliberate step down in intensity, not the only mode that exists.

## Mobile implementation rules

The HTML reference files use a fake phone-bezel frame (fixed 390×820px) purely for presenting the mockup in a browser — strip that out entirely for the real build.

- Full real viewport: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. Size the root screen to `100dvh` (with a `100vh` fallback for older WebViews), not a hardcoded height — mobile browser chrome shows/hides and changes the usable viewport.
- Respect safe areas on every edge that touches the screen boundary:
  - Top wordmark / header: `padding-top: max(16px, env(safe-area-inset-top))`
  - Bottom floating tab bar: `bottom: max(16px, env(safe-area-inset-bottom))` instead of a bare `16px`
  - Any full-bleed background layer should still run edge-to-edge (`inset:0`), only the *content* needs the inset padding
- Keep `--radius-pill` (999px) and `--radius-card` (24px) for ordinary buttons/cards. For a glass panel acting as a bottom sheet or full-screen card, go slightly larger (28–32px) and only round the top two corners — that reads as a native sheet, matching iOS/Android system sheet conventions.

## Persistent top wordmark — required on every screen

This is the single biggest structural change from the original app: a small "THYMOS" wordmark sits centered at the very top edge of **every** top-level screen — every onboarding step and every tab — not just a landing/marketing moment, and not competing for space inside the same row as back-buttons or the settings icon.

```css
.brand-mark{
  position:absolute; top:max(22px, env(safe-area-inset-top)); left:0; right:0; z-index:21;
  text-align:center; font-family:var(--serif); font-weight:300;
  font-size:0.95rem; letter-spacing:0.26em; color:rgba(255,255,255,0.85);
  text-shadow:0 2px 14px rgba(10,20,35,0.25); pointer-events:none;
}
```

Give it its own row, and push the back-button/progress-dots row (onboarding) or the back-button/settings-icon row (app tabs) down below it with extra `padding-top` so the two never collide. If a screen currently puts the wordmark at the left edge of a single cramped topbar row (as the original did), that's the thing to fix — center it on its own line at the true top instead.

## Icon philosophy

No off-the-shelf emotional cliché icons — no filled heart for "connection/support," no lightbulb for "ideas." Every icon is small and custom-drawn, tied to the actual theme. Example — replace a generic heart with a simple sun (fits the sky/paradise theme):

```html
<svg width="28" height="28" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="4.3" fill="var(--umber-light)"/>
  <g stroke="var(--umber-light)" stroke-width="1.6" stroke-linecap="round">
    <line x1="12" y1="2" x2="12" y2="4.2"/><line x1="12" y1="19.8" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="4.2" y2="12"/><line x1="19.8" y1="12" x2="22" y2="12"/>
    <line x1="4.9" y1="4.9" x2="6.4" y2="6.4"/><line x1="17.6" y1="17.6" x2="19.1" y2="19.1"/>
    <line x1="4.9" y1="19.1" x2="6.4" y2="17.6"/><line x1="17.6" y1="6.4" x2="19.1" y2="4.9"/>
  </g>
</svg>
```

Give each icon a soft tinted circle behind it (~56-64px), matching whichever accent family that screen leans on (pale sky-blue, sage-green, or warm cream-beige).

## Screens to build

### Onboarding (11 steps — see `thymos-onboarding-v4-sun-icon.html`)

1. **Landing** — full-clarity sky photo, "It's time to actually re-connect." headline, "Begin" pill button, "Sign in with your email" text link.
2. **Concept reveal** — same full-clarity photo, staged fade-in of the Logos/Eros/Thymos lines, ending in the big "THYMOS" wordmark and an arrow to continue.
3. **Path choice** — ambient/blurred photo begins here, glass card holds two choice cards: Thymos vs Telos.
4. **Name input** — glass card, single text field, Continue.
5. **"What's been weighing on you?"** — multi-select chips (Anxiety, Loneliness, Self-doubt, Burnout, Grief, Relationship struggles, Identity, Depression, Overwhelm, Anger) + free-text fallback.
6. **"What are you reaching toward?"** — multi-select chips (Inner peace, Confidence, Self-acceptance, Better boundaries, Emotional awareness, Resilience, Purpose, Patience, Letting go, Vulnerability).
7. **"What kind of connection are you hoping for?"** — multi-select chips (A listener, Mutual support, Accountability partner, Someone who gets it, Honest conversations, Growth together, Non-judgmental space, Shared experiences).
8. **Offer + capacity** — multi-select "What can you offer someone else right now?" chips, plus a single-select "How much room do you have?" (Very little / Some / A good amount).
9. **Optional free-text wish** — "What's one thing you wish someone understood about where you are right now?" with a Skip option.
10. **Dynamic summary** — "Here's what I'm hearing…" as ONE flowing serif sentence interpolating the user's picks (not a redundant chip list underneath). Interpolated words get a dotted underline and are individually tappable to go back and change that one choice. Sun icon above (not a heart). "Yes, that's me →" to confirm.
11. **Email capture** — magic-link email field, "press enter" hint.

Progress dots + back button sit in their own row beneath the persistent top wordmark on every step after the landing/reveal.

### Main app shell (see `thymos-app-v4-ambient-allpages.html`)

- **Home**: greeting ("Good afternoon / Hi, [name]") directly on the ambient sky, "Today's reflection" prompt card as glass, "Quick links" list (Connections, Journal, Find support) as glass rows with custom icons.
- **Chat**: "Messages" header on the ambient sky, message rows as glass (avatar, name, timestamp, preview).
- **Connect**: "Your circle" header, connection rows as glass with a "Chat" pill action, dashed "Find a new match →" ghost row (translucent, not fully transparent, so it stays visible over the photo).
- **Telos**: "Telos" header, filter pills (All/Offerings/Requests — glass when unselected, solid ink when active), empty state as a glass card with a custom painterly tree icon.
- Floating pill tab bar (Home/Chat/Connect/Telos) at the bottom — already glass in style, just needs the safe-area bottom inset on a real device.

## What NOT to carry over from the reference files

- The fixed-size phone-bezel frame (`.phone`/`.screen` demo wrapper) — presentation-only.
- Any hardcoded pixel heights standing in for viewport height.
- The original flat-cream-with-solid-paper-cards look — fully superseded by the glass-on-ambient-sky pattern above, app-wide.
