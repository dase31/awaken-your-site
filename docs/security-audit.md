# Security audit: 25-point pre-launch checklist

Run 2026-11-14 against the checklist at
https://vibeaudits.com/blog/vibe-coded-app-security-checklist.

Method: read the code and configuration; applied every migration to a scratch
Postgres and attacked it as separate signed-in users and as a signed-out
visitor; served the production build with the new headers and checked the
browser for blocked resources. Not done: anything that needs your Supabase,
Vercel or Apple dashboards (marked **You**), and nothing was run against the
live project.

Status: ✅ ok · 🔧 found and fixed in code (needs deploy) · ⚠️ needs you · ➖ not applicable

## Secrets and credentials

| # | Check | Status | Notes |
|---|---|---|---|
| 1 | No hardcoded secrets | ✅ | Searched the tree and all git history for key patterns, private keys, service-role keys and tokens: none. Only the public publishable key and one old project's anon key (public by design). |
| 2 | No secrets in client code | ✅ | The app reads three `VITE_` values: URL, project id and the `sb_publishable` key, all public by design. The service-role key exists only inside edge functions. |
| 3 | Env vars set in every environment | ⚠️ **You** | See #4: production may be relying on the committed `.env`. |
| 4 | `.gitignore` ignores `.env` | ⚠️ **You** | `.env` is listed in `.gitignore` but **was committed earlier**, so it is still tracked. It holds only public values, so nothing leaked, but untrack it. **Order matters:** first add the same three `VITE_` variables in Vercel → Project Settings → Environment Variables, then `git rm --cached .env`. Doing it the other way round breaks the live site. Also added `*.p8`, `*.pem`, `AuthKey_*` etc. to `.gitignore` so the Apple push key can't be committed by accident. 🔧 |

## Authentication

| # | Check | Status | Notes |
|---|---|---|---|
| 5 | Passwords hashed | ➖ | Sign-in is by emailed code. The only password is the App Review demo account, handled and hashed by Supabase Auth. Use a long random one. |
| 6 | Sessions expire | ⚠️ **You** | Handled by Supabase (access tokens default to 1 hour, refreshed automatically). Confirm: Auth → Sessions. |
| 7 | JWT secret strong | ✅ | Managed by Supabase, never in the repo. |
| 8 | Reset tokens expire, single-use | ➖ | No password reset. Sign-in codes are single-use. **You:** Auth → Providers → Email → OTP expiry (default 1 hour; 10–15 minutes is better). |
| 9 | Email verified before access | ✅ | Signing in with the emailed code is the verification. |
| 10 | OAuth state validated | ➖ | No OAuth providers. |

## Authorization

| # | Check | Status | Notes |
|---|---|---|---|
| 11 | Every API route checks the caller | 🔧 | `find-match` trusted a user id sent in the request body and didn't require a session. Now it identifies the caller from their sign-in token and returns 401 without one. `notify` is only callable with a shared secret. |
| 12 | Users only reach their own data | 🔧 | Tested as two users. Journals, tags, settings, safety answers, blocks, reports, tokens: isolated ✅. **Found and fixed:** (a) every signed-in user could read every profile including the free text others wrote about their struggles; (b) anyone could open a conversation with anyone, skipping requests, pause and limits; (c) a request's receiver could rewrite who it came from. |
| 13 | Admin routes restricted | ➖ | No admin panel. Reports are read in the Supabase dashboard. |
| 14 | Tenant boundaries at DB level | ➖ | Not multi-tenant. Person-to-person isolation is #12. |

## Input validation

| # | Check | Status | Notes |
|---|---|---|---|
| 15 | Parameterised queries | ✅ | All data access goes through the Supabase client; SQL functions use no dynamic SQL. `find-match` interpolated request ids into a filter; now only well-formed UUIDs are accepted. |
| 16 | Uploads restricted | ➖ | No file uploads or storage. |
| 17 | User input sanitised before HTML | ✅ | React escapes everything. The only `dangerouslySetInnerHTML` is in an unused chart helper that takes developer config. Notification emails HTML-escape names. Hate-slur filters exist on messages and Telos posts. |

## Rate limiting

| # | Check | Status | Notes |
|---|---|---|---|
| 18 | Login rate-limited | ⚠️ **You** | Handled by Supabase Auth, and the app shows "slow down" on 429. Check Auth → Rate Limits and keep the defaults or stricter. |
| 19 | Reset/email endpoints limited | 🔧 | Sign-in email is limited by Supabase. Added: 25 connection requests per person per day (each can trigger an email or push), and ceilings per recipient of 5 emails and 20 pushes per hour. |
| 20 | AI endpoints spend-limited | ➖ | No LLM calls anywhere; theme extraction runs on the device. A stale `extract-themes` config entry was removed. **You:** confirm no `extract-themes` function is deployed (Edge Functions list); delete it if so. |

## Payments and webhooks

| # | Check | Status | Notes |
|---|---|---|---|
| 21–23 | Stripe signature, idempotency, subscription checks | ➖ | No payments. |

## Infrastructure

| # | Check | Status | Notes |
|---|---|---|---|
| 24 | RLS on every table | ✅ / 🔧 | All 20 tables have RLS; signed-out visitors get nothing from any table; writes are constrained to the caller. The gaps above (profiles, conversations, request rewriting) are fixed in `supabase/migrations/20261114000000_security_hardening.sql`. Also fixed: conversations never moved up on a new message (trigger ran without permission). |
| 25 | Errors don't leak internals | ✅ | Edge functions return generic errors and log details server-side; source maps are not published. |

## Beyond the list

- 🔧 **Security headers** added in `vercel.json`: CSP, no framing, no MIME sniffing, referrer and permissions policies. Tested on the production build: no blocked resources.
- 🔧 **Dependencies:** `npm audit fix` cleared the fixable ones. Remaining: `react-router` open-redirect (our deep links are now validated against a strict pattern, and in-app navigation uses allow-lists) and `zod` (not used by our code).
- ⚠️ **Redirect URLs:** Supabase → Auth → URL Configuration. Keep the allow-list to the exact production site (and nothing like a wildcard) so sign-in links can't be pointed elsewhere.
- ⚠️ **Data API:** Supabase → Settings → API: only `public` exposed.
- Known design limits: no per-user cap on messages or Telos posts; no remote crash logging.

## Applied to the live project (THYMOS Wrk, 2026-11-14, via the Supabase connector)

- ✅ `20261114000000_security_hardening.sql`: conversations need consent, requests can't be rewritten, conversations sort again, 25 requests/day limit, function fixes.
- ✅ `20261114000002_trigger_function_grants.sql`: trigger functions no longer callable over the API.
- ✅ `find-match` v2 deployed: refuses callers without a valid session (tested: 401 with no token and with a junk token).
- ✅ Confirmed on the live project: all 16 tables have RLS; no stray `extract-themes` function; only `find-match` was deployed before this.
- Security advisor now shows only: five helper functions signed-in users must be able to call (policies and the app use them; each checks the caller itself), and "leaked password protection disabled" (a Pro-plan feature; only the App Review demo account uses a password, so use a long random one).

## Still to apply

1. **`20261114000001_private_profiles.sql`: together with pushing the app code.** It stops other people reading each other's profiles. Old app builds read other people's names from `profiles` and show "Unknown" once it's applied, which is why it waits for the release. Live data right now is two test profiles, so exposure today is small, but apply it before real users arrive.
2. **Notifications**: `20261113000000_notifications_and_matching_limits.sql`, deploy `notify`, set its secrets (`docs/notifications-setup.md`). The app code already handles the table being missing, but Home, Settings and the opt-in screen need it.
3. **Vercel**: add the three `VITE_` variables before pushing (see item 4 above).
4. **Dashboard-only items** (the connector can't reach auth settings): sign-in code expiry, auth rate limits, redirect URL allow-list, session lifetime.
