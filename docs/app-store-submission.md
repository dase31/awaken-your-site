# Thymos — App Store submission

Everything here is copy-paste for App Store Connect, plus the steps only the account holder can do.

## 1. One-time setup (you)

1. **Supabase** — restore the project if it's paused. Free-tier projects auto-pause, which takes the app down for everyone, including App Review. Upgrade to Pro before submitting.
2. **Run the migration** — paste `supabase/migrations/20261008000000_app_store_requirements.sql` into the SQL editor. (Block, report, content filter, delete-account, private safety check.)
3. **Email templates** — Authentication → Email Templates. In *both* "Confirm signup" and "Magic Link", add the code so the iOS app can sign in without opening a browser link:
   ```html
   <p>Your Thymos code: <strong>{{ .Token }}</strong></p>
   ```
   Keep the existing link too. New users receive the "Confirm signup" template; returning users get "Magic Link".
4. **Support mailbox** — create `support@thymos.world`. It's published on `/support` and in the app's Safety menu; Apple checks that it works.
5. **Reviewer accounts** — follow the header of `supabase/seed/app_review.sql`, then run it.
6. **Redirect URLs** — Authentication → URL Configuration: keep `https://thymos.world` as the Site URL.
7. **Bundle ID** — `world.thymos.app`. Register it at developer.apple.com → Identifiers (change `appId` in `capacitor.config.ts` and re-run `npx cap sync ios` if you want another).
8. **Xcode** — App Store builds must use the current Xcode / iOS SDK. This machine has Xcode 16.4 with no iOS platform installed, so the native build could not be compiled here. Install the latest Xcode and its iOS platform, then:
   ```bash
   npm run build && npx cap sync ios && npx cap open ios
   ```
   In Xcode: select the App target → Signing & Capabilities → pick your Team. Product → Archive → Distribute App → App Store Connect.
9. **Icon** — `resources/icon.png` is a placeholder (a white T on the sky gradient). Replace it with the real artwork (1024×1024, no transparency) and run `npx capacitor-assets generate --ios`.

## 2. App Store Connect listing

- **Name:** Thymos
- **Subtitle:** Be heard. Listen. Help.
- **Category:** Primary *Lifestyle*, secondary *Social Networking*. Avoid "Health & Fitness" / "Medical": the app is peer support, not treatment.
- **Age rating:** answer the questionnaire honestly — *User-generated content: yes*, *Unrestricted web access: no*, *Medical/treatment info: no*. Expect **17+** or at least 12+; the terms already require 18+.
- **Promotional text:** Find one person who understands what you're going through — or offer a skill and get real help.
- **Description:**
  > Thymos connects you one-to-one with someone who understands.
  >
  > Tell us, in your own words, what's been weighing on you and what kind of support you're after. We match you with one person at a time — no feeds, no followers, no performance.
  >
  > • Be heard, or listen — match with someone whose experience overlaps with yours
  > • Telos — offer a skill, or ask for real help with something real
  > • A private journal with a daily reflection
  > • Block or report anyone, any time
  >
  > Thymos is peer support between people. It is not therapy, medical advice, or a crisis service. If you are in danger, contact your local emergency number.
- **Keywords:** peer support,listening,loneliness,community,journal,reflection,connection,anxiety,mutual aid
- **Support URL:** https://thymos.world/support
- **Privacy Policy URL:** https://thymos.world/privacy
- **Terms (EULA):** use Apple's standard EULA, or paste the link https://thymos.world/terms into the App Store description.
- **Screenshots:** 6.9" iPhone set (1320×2868) — Home, Match, Chat, Telos, Journal. Capture from the Simulator once the build runs.

## 3. App Privacy (nutrition labels)

All data is linked to the user; **none is used for tracking**; no third-party ad or analytics SDKs.

| Data type | Why |
|---|---|
| Email address | Account, sign-in |
| Name (display name) / User ID | Account, profile |
| Other user content (messages, journal*, Telos posts, profile answers) | App functionality (matching, chat) |
| Sensitive info (struggles & goals the user selects) | App functionality (matching) |
| Device ID (the push token, only if the user turns on app notifications) | App functionality (notifications) |

\*Journal reflections are stored on the device only.

The private safety answer is stored in an owner-only table and is never shown to other users. Theme extraction runs on the device — no text is sent to an AI provider.

## 4. App Review notes (paste into "Notes")

> Thymos is a peer-support app (18+). Members are matched one-to-one and chat; they can also post and answer requests in "Telos".
>
> **Demo account** — on the sign-in screen tap "Use a password instead":
> Email: reviewer@thymos.world
> Password: *(the password you set)*
> The account already has a profile and an open conversation so every feature can be reviewed.
>
> **User-generated content safeguards (Guideline 1.2)**
> - Terms and Privacy Policy are linked at sign-up and under Settings; users must be 18+.
> - Objectionable content: messages and Telos posts containing slurs are rejected by a database trigger before they are saved.
> - Report: ⋯ menu in any chat and on every Telos post → choose a reason. Reports go to a `reports` table reviewed by the team.
> - Block: same menu. Blocking is enforced in the database — blocked people can't message, request, or be matched again and disappear from lists. Manage under Settings → Blocked people.
> - Contact: support@thymos.world, linked in-app and at /support. We review reports and remove offending content and accounts within 24 hours.
> - Crisis resources: Settings → Safety, and shown to anyone who answers "yes" to the private safety check.
>
> **Account deletion**: Settings → Delete account permanently deletes the account and all associated data immediately.
>
> **Sign-in**: email one-time code or link; no passwords for regular users, no third-party sign-in.

## 5. Moderation commitment (needs a human)

Apple expects reports to be acted on within 24 hours. Check open reports daily:

```sql
select r.created_at, r.reason, r.reported_name, r.details, r.context
from reports r where r.status = 'open' order by r.created_at;
```

To remove a user: delete them in Authentication → Users (cascades). Then `update reports set status = 'actioned' where id = '…'`.

## 6. Known limitations

- **Profiles are readable by any signed-in user** (`profiles` SELECT policy is `USING (true)`). Fields are display name, username, capacity, quote. Not a blocker for review, but worth tightening before growth.
- **Push notifications** are implemented (new request, accepted request, new message; never message text) and are opt-in. Setup steps are in `docs/notifications-setup.md`. The Push Notifications capability must be enabled for the app ID, otherwise registration fails silently.
- Terms and Privacy text is a good-faith draft — have a lawyer read it before launch.
- The iOS native build has not been compiled on this machine (see step 8).
