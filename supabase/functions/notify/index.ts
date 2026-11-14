// Sends the push and email notifications.
//
// Called only by the database triggers in
// 20261113000000_notifications_and_matching_limits.sql (via pg_net), with a
// shared secret in the x-notify-secret header. It never receives message
// text: notifications say that something happened, not what was said.
//
// Secrets (supabase secrets set ...):
//   NOTIFY_SECRET      must equal: SELECT value FROM notify_config WHERE key='secret'
//   APNS_KEY_ID        10-character key id from the Apple Developer account
//   APNS_TEAM_ID       10-character team id
//   APNS_PRIVATE_KEY   full contents of the AuthKey_XXXX.p8 file
//   APNS_BUNDLE_ID     optional, defaults to world.thymos.app
//   APNS_ENV           "production" (default) or "sandbox" for Xcode debug builds
//   RESEND_API_KEY     Resend API key (emails are skipped if unset)
//   EMAIL_FROM         optional, defaults to "Thymos <no-reply@thymos.world>"
//   SITE_URL           optional, defaults to https://www.thymos.world
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Kind = "request_received" | "request_accepted" | "message";

interface Payload {
  kind: Kind;
  recipient: string;
  actor: string;
  ref: string | null;
}

const BUNDLE_ID = Deno.env.get("APNS_BUNDLE_ID") ?? "world.thymos.app";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://www.thymos.world";
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "Thymos <no-reply@thymos.world>";
const SUPPORT_EMAIL = "support@thymos.world";

// Don't ping someone again about the same thing inside these windows.
const PUSH_WINDOW_MIN = 5;
const EMAIL_WINDOW_MIN = 60;
// Hard ceilings per recipient per hour.
const MAX_PUSH_PER_HOUR = 20;
const MAX_EMAIL_PER_HOUR = 5;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// ── Copy ─────────────────────────────────────────────────────
function compose(kind: Kind, actorName: string, ref: string | null) {
  const name = actorName || "Someone";
  switch (kind) {
    case "request_received":
      return {
        title: "Someone wants to connect",
        body: `${name} would like to connect with you.`,
        route: "/connect",
        subject: "Someone would like to connect with you on Thymos",
        lead: `${name} would like to connect with you.`,
      };
    case "request_accepted":
      return {
        title: "You're connected",
        body: `${name} accepted your request. Say hello.`,
        route: "/chat",
        subject: "Your connection request was accepted",
        lead: `${name} accepted your request. You can start talking now.`,
      };
    case "message":
      return {
        title: "New message",
        body: `${name} sent you a message.`,
        route: ref ? `/chat/${ref}` : "/chat",
        subject: "You have a new message on Thymos",
        lead: `${name} sent you a message.`,
      };
  }
}

// ── APNs ─────────────────────────────────────────────────────
let cachedJwt: { token: string; at: number } | null = null;

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function apnsJwt(): Promise<string | null> {
  const keyId = Deno.env.get("APNS_KEY_ID");
  const teamId = Deno.env.get("APNS_TEAM_ID");
  const pem = Deno.env.get("APNS_PRIVATE_KEY");
  if (!keyId || !teamId || !pem) return null;

  // Apple wants a token no older than an hour and no newer than every 20 min.
  if (cachedJwt && Date.now() - cachedJwt.at < 40 * 60 * 1000) return cachedJwt.token;

  const der = Uint8Array.from(
    atob(pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "").replace(/\s+/g, "")),
    (c) => c.charCodeAt(0),
  );
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);

  const enc = new TextEncoder();
  const header = b64url(enc.encode(JSON.stringify({ alg: "ES256", kid: keyId })));
  const claims = b64url(enc.encode(JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) })));
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(`${header}.${claims}`)),
  );

  const token = `${header}.${claims}.${b64url(sig)}`;
  cachedJwt = { token, at: Date.now() };
  return token;
}

type ApnsResult = "sent" | "dead" | "failed";

async function sendApns(deviceToken: string, message: ReturnType<typeof compose>, ref: string | null): Promise<ApnsResult> {
  const jwt = await apnsJwt();
  if (!jwt) return "failed";

  const configured = (Deno.env.get("APNS_ENV") ?? "production") === "sandbox" ? "sandbox" : "production";
  const hosts = {
    production: "https://api.push.apple.com",
    sandbox: "https://api.sandbox.push.apple.com",
  };
  // A token from an Xcode build only works against sandbox and one from
  // TestFlight/App Store only against production, so retry the other once.
  const order = configured === "production" ? (["production", "sandbox"] as const) : (["sandbox", "production"] as const);

  const body = JSON.stringify({
    aps: { alert: { title: message.title, body: message.body }, sound: "default" },
    route: message.route,
    ref,
  });

  for (const env of order) {
    const res = await fetch(`${hosts[env]}/3/device/${deviceToken}`, {
      method: "POST",
      headers: {
        authorization: `bearer ${jwt}`,
        "apns-topic": BUNDLE_ID,
        "apns-push-type": "alert",
        "apns-priority": "10",
        "content-type": "application/json",
      },
      body,
    });

    if (res.ok) return "sent";

    const reason = (await res.json().catch(() => ({})))?.reason as string | undefined;
    if (reason === "BadDeviceToken" || reason === "DeviceTokenNotForTopic") continue; // maybe the other environment
    if (res.status === 410 || reason === "Unregistered") return "dead";
    console.error("APNs error", res.status, reason);
    return "failed";
  }
  return "dead";
}

// ── Email ────────────────────────────────────────────────────
function emailHtml(message: ReturnType<typeof compose>) {
  const lead = escapeHtml(message.lead);
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F7F5F1;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F1;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;">
        <tr><td align="center" style="padding-bottom:20px;font-family:Georgia,serif;font-weight:300;font-size:15px;letter-spacing:0.26em;color:#59564F;">THYMOS</td></tr>
        <tr><td style="background:#FCFBF7;border-radius:28px;padding:36px 28px;text-align:center;font-family:-apple-system,Helvetica,Arial,sans-serif;color:#1C1B18;">
          <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:24px;line-height:1.3;font-weight:300;">${lead}</p>
          <a href="${SITE_URL}${message.route}" style="display:inline-block;background:#1C1B18;color:#FCFBF7;text-decoration:none;font-size:15px;font-weight:500;padding:13px 30px;border-radius:999px;">Open Thymos</a>
        </td></tr>
        <tr><td align="center" style="padding-top:20px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#77756F;">
          You're getting this because you turned on email notifications.<br>
          You can turn them off any time in Thymos under Settings &rarr; Notifications.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendEmail(to: string, message: ReturnType<typeof compose>): Promise<boolean> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to,
      reply_to: SUPPORT_EMAIL,
      subject: message.subject,
      html: emailHtml(message),
      text: `${message.lead}\n\nOpen Thymos: ${SITE_URL}${message.route}\n\nYou can turn these emails off in Thymos under Settings > Notifications.`,
      headers: { "List-Unsubscribe": `<mailto:${SUPPORT_EMAIL}?subject=Unsubscribe>` },
    }),
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text().catch(() => ""));
  return res.ok;
}

// ── Handler ──────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const secret = Deno.env.get("NOTIFY_SECRET");
  if (!secret || req.headers.get("x-notify-secret") !== secret) return json({ error: "unauthorized" }, 401);

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }
  const { kind, recipient, actor, ref } = payload;
  if (!["request_received", "request_accepted", "message"].includes(kind) || !recipient || !actor) {
    return json({ error: "bad request" }, 400);
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const { data: settings } = await supabase
      .from("user_settings")
      .select("push_enabled, email_enabled")
      .eq("user_id", recipient)
      .maybeSingle();

    if (!settings || (!settings.push_enabled && !settings.email_enabled)) return json({ skipped: "not opted in" });

    // Never notify someone about a person they've blocked (or who blocked them).
    const { data: blocks } = await supabase
      .from("user_blocks")
      .select("blocker_id")
      .or(
        `and(blocker_id.eq.${recipient},blocked_id.eq.${actor}),and(blocker_id.eq.${actor},blocked_id.eq.${recipient})`,
      )
      .limit(1);
    if (blocks && blocks.length > 0) return json({ skipped: "blocked" });

    const { data: actorProfile } = await supabase.from("profiles").select("display_name").eq("id", actor).maybeSingle();
    const message = compose(kind, actorProfile?.display_name ?? "", ref);

    const recentlySent = async (channel: "push" | "email", windowMin: number) => {
      const since = new Date(Date.now() - windowMin * 60 * 1000).toISOString();
      let q = supabase
        .from("notification_log")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", recipient)
        .eq("kind", kind)
        .eq("channel", channel)
        .gte("created_at", since);
      q = ref ? q.eq("ref", ref) : q.is("ref", null);
      const { count } = await q;
      return (count ?? 0) > 0;
    };
    const log = (channel: "push" | "email") =>
      supabase.from("notification_log").insert({ user_id: recipient, kind, ref, channel });

    // Overall ceilings per person, whatever the cause, so nobody's inbox or
    // phone can be flooded (and our email bill can't be run up).
    const countSince = async (channel: "push" | "email", minutes: number) => {
      const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("notification_log")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", recipient)
        .eq("channel", channel)
        .gte("created_at", since);
      return count ?? 0;
    };
    const pushCapped = (await countSince("push", 60)) >= MAX_PUSH_PER_HOUR;
    const emailCapped = (await countSince("email", 60)) >= MAX_EMAIL_PER_HOUR;

    let pushed = false;
    let emailed = false;

    if (settings.push_enabled && !pushCapped && !(await recentlySent("push", PUSH_WINDOW_MIN))) {
      const { data: tokens } = await supabase.from("push_tokens").select("id, token").eq("user_id", recipient);
      for (const t of tokens ?? []) {
        const result = await sendApns(t.token, message, ref);
        if (result === "sent") pushed = true;
        if (result === "dead") await supabase.from("push_tokens").delete().eq("id", t.id);
      }
      if (pushed) await log("push");
    }

    // A message that already reached their phone doesn't also need an email;
    // requests and acceptances are rarer and worth both.
    const skipEmail = kind === "message" && pushed;
    if (settings.email_enabled && !skipEmail && !emailCapped && !(await recentlySent("email", EMAIL_WINDOW_MIN))) {
      const { data: userRes } = await supabase.auth.admin.getUserById(recipient);
      const to = userRes?.user?.email;
      if (to && (await sendEmail(to, message))) {
        emailed = true;
        await log("email");
      }
    }

    return json({ pushed, emailed });
  } catch (error) {
    console.error("notify failed:", error);
    return json({ error: "internal" }, 500);
  }
});
