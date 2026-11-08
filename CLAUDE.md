# Thymos

React 18 + Vite + TS + Tailwind + Supabase, wrapped with Capacitor for iOS.

## Design: single source of truth

`docs/design/thymos-redesign-brief.md` is the ONLY branding guideline. Match
`docs/design/reference/*.html` visually. Do not use any other style.

- Ambient sky + glass everywhere: fixed `.th-ambient` behind every screen, all UI as `.th-glass*`. No flat cream/paper/solid-white cards.
- Centered "THYMOS" wordmark on its own top row on every screen (`.th-brand-mark`); back/settings row below.
- Tokens and classes are `--th-*` / `.th-*` in `src/index.css`. Reuse them; build screens with `<AppShell variant="ambient">`.
- `100dvh`, `env(safe-area-inset-*)` on edge-touching elements, real image assets (no base64).
- Custom line-art icons only (`src/components/icons/ThymosIcons.tsx`), no generic heart/lightbulb.
- Modals/sheets portal to `document.body`.
- No placeholder people or fake content in the app; use empty states.

## Checks

- Typecheck: `npx tsc --noEmit -p tsconfig.app.json` (root tsc checks nothing).
- Never commit `.env`. Don't push to main unless asked (Vercel deploys it).
