# Notifications and matching limits: setup

The code is in place. These are the steps that need your accounts. Do them in
order; nothing is live until step 4.

What exists:

- **Opt-in** screen after choosing a username (`/notifications-setup`), a card
  on Home for existing accounts, and switches in Settings. Saying yes opts in
  to app notifications (iOS permission prompt) and email.
- **Pause matching** and **limit my connections** in Settings. Enforced in the
  database (nobody can send a request to a paused or full person) and in the
  `find-match` function (they are never suggested).
- Three events trigger a notification: connection request received, request
  accepted, new message. Content is never included, only that something happened.
- An error screen for crashes, and a toast for failures that happen outside
  rendering.

## 1. Run the migration

Supabase dashboard → **SQL Editor** → paste
`supabase/migrations/20261113000000_notifications_and_matching_limits.sql` → **Run**.
It is safe to run twice. It creates `user_settings`, `push_tokens`, the request
guard, and the database triggers.

Then read the shared secret it generated, you need it in step 3:

```sql
select value from notify_config where key = 'secret';
```

## 2. Create the Apple push key (once)

1. developer.apple.com → **Certificates, Identifiers & Profiles** → **Keys** →
   **+**. Name it "Thymos push", tick **Apple Push Notifications service
   (APNs)**, continue, register, **Download** the `.p8` file. You can only
   download it once; keep it somewhere safe.
2. Note the **Key ID** (10 characters, shown on the key) and your **Team ID**
   (top right of the developer site, under Membership).
3. **Identifiers** → open `world.thymos.app` → tick **Push Notifications** → Save.

## 3. Set the function secrets and deploy

Replace the values, then run in the project folder (you need the Supabase CLI
logged in and linked to the project):

```bash
supabase secrets set NOTIFY_SECRET="<value from step 1>"
supabase secrets set APNS_KEY_ID="<key id>" APNS_TEAM_ID="<team id>"
supabase secrets set APNS_PRIVATE_KEY="$(cat /path/to/AuthKey_XXXXXXXXXX.p8)"
supabase secrets set RESEND_API_KEY="<your Resend key>"
supabase functions deploy notify
supabase functions deploy find-match
```

Optional: `APNS_ENV=sandbox` while testing builds installed from Xcode (the
function also retries the other environment automatically), `EMAIL_FROM`,
`SITE_URL`.

Never paste the `.p8` contents or the Resend key into the repo or into chat.

## 4. Xcode

```bash
npm run build && npx cap sync ios && npx cap open ios
```

In **Signing & Capabilities** for the App target, confirm **Push
Notifications** is listed (the entitlements file is already attached). Run on a
real iPhone; push does not work in the simulator.

## 5. Check it works

1. Sign in on the phone, accept notifications. In SQL:
   `select * from push_tokens;` should show a row.
2. From a second account, send a connection request. The phone should buzz,
   and an email should arrive if email notifications are on.
3. Pause matching on one account; the other account should not be shown it,
   and a request to it fails with "They're not taking new connections right now."
4. Function logs: dashboard → Edge Functions → `notify` → Logs.

## Limits to know about

- A repeat notification about the same conversation is held back for 5 minutes
  (push) and 60 minutes (email), so a back-and-forth doesn't flood anyone.
- A message that already reached the phone as a push is not also emailed.
- Signing out removes that phone's token, so it stops receiving the previous
  person's notifications.
- `find-match` still takes a user id in the request body without checking the
  caller (`verify_jwt = false`). Tighten that in the security pass.
