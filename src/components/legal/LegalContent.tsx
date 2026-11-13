import { Link } from "react-router-dom";
import { APP_NAME, LEGAL_LAST_UPDATED, MIN_AGE, SUPPORT_EMAIL } from "@/lib/config";

// The wording here describes what the app actually does. If you change how
// data is collected, stored, or shared, update the matching section.

function Doc({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="text-legal">
      <h1
        className="font-display text-4xl mb-2"
        style={{ textShadow: "0 2px 16px rgba(0,60,120,0.2)" }}
      >
        {title}
      </h1>
      <p className="text-legal/50 text-sm mb-10">Last updated {LEGAL_LAST_UPDATED}</p>
      <div className="space-y-8">{children}</div>
    </article>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl mb-3 text-legal">{heading}</h2>
      <div className="space-y-3 text-legal/80 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-5 list-disc marker:text-legal/40">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

const Mail = () => (
  <a className="underline underline-offset-2 hover:text-legal" href={`mailto:${SUPPORT_EMAIL}`}>
    {SUPPORT_EMAIL}
  </a>
);

export function TermsContent() {
  return (
    <Doc title="Terms of Use">
      <Section heading="What Thymos is">
        <p>
          {APP_NAME} connects people one-to-one so they can talk about what they're going through, and
          lets members offer or ask for practical help through Telos. It is a place for peer support
          between people. It is not therapy, medical advice, or a crisis service, and the people you
          meet here are not professionals acting for us.
        </p>
        <p>
          If you are in crisis or in danger, don't wait for a reply here. Contact your local emergency
          number, or see our <Link className="underline underline-offset-2 hover:text-legal" to="/crisis">crisis resources</Link>.
        </p>
      </Section>

      <Section heading="Who can use it">
        <p>
          You must be {MIN_AGE} or older. By creating an account you confirm that you are, and that
          the information you give us is accurate.
        </p>
      </Section>

      <Section heading="Your account">
        <p>
          You're responsible for what happens under your account. One person, one account. Tell us
          straight away if you think someone else has got into yours.
        </p>
      </Section>

      <Section heading="How we expect people to behave">
        <p>
          People come here at difficult moments. We have no tolerance for objectionable content or abusive
          users. You must not use {APP_NAME} to:
        </p>
        <List
          items={[
            "harass, bully, threaten, or intimidate anyone",
            "post hate speech or discriminate against people for who they are",
            "send sexual content, or ask for sexual or romantic contact from people who haven't welcomed it",
            "encourage or glorify self-harm, suicide, or eating disorders",
            "share someone else's private information, or pretend to be another person",
            "advertise, sell, or recruit, or send spam",
            "do anything illegal, or involve anyone under 18",
          ]}
        />
        <p>
          Messages and Telos posts containing hate slurs are blocked automatically. Everything else
          depends on people reporting it, so please do.
        </p>
      </Section>

      <Section heading="Reporting and blocking">
        <p>
          You can report a person or a Telos post, and block anyone, from inside the app. Blocking stops
          all contact between you straight away and removes them from your matches. Reports go to us, and
          we aim to review each one within 24 hours. We may remove content, warn people, or suspend or
          permanently remove accounts that break these rules. Send questions or urgent concerns to{" "}
          <Mail />.
        </p>
      </Section>

      <Section heading="Notifications and your availability">
        <p>
          If you turn notifications on, we'll tell you by app notification and email when someone wants to
          connect, accepts your request, or messages you. You can turn these off, pause matching, or limit
          how many connections you have at any time in Settings. While matching is paused, or once you're
          at your limit, other members can't send you new requests.
        </p>
      </Section>

      <Section heading="Your content">
        <p>
          What you write stays yours. To run the service you give us permission to store it and show it
          to the people it's meant for — for example, your messages to the person you're talking to, and
          your Telos posts to other members. Your private reflections are visible only to you.
        </p>
      </Section>

      <Section heading="Telos and dealing with other members">
        <p>
          Telos lets members offer skills or ask for help. We don't check anyone's identity, skills, or
          qualifications, and we aren't a party to anything members agree between themselves. Use your
          judgement. Don't share financial details, passwords, or your address with people you've only
          just met, and treat advice from other members as one person's view, not professional advice.
        </p>
      </Section>

      <Section heading="Ending your account">
        <p>
          You can delete your account at any time from Settings. It removes your profile, messages,
          reflections, and connections. We can suspend or remove accounts that break these terms.
        </p>
      </Section>

      <Section heading="What we can't promise">
        <p>
          {APP_NAME} is provided as it is. We work to keep it available and safe but can't guarantee it
          will always be uninterrupted or error-free, or that every member behaves well. To the extent the
          law allows, we aren't liable for losses arising from your use of the service or from what other
          members say or do. Nothing here limits rights you have by law that can't be limited.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          We may update these terms. If the change matters, we'll tell you in the app. Carrying on after
          that means you accept the new version.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          <Mail />
        </p>
      </Section>
    </Doc>
  );
}

export function PrivacyContent() {
  return (
    <Doc title="Privacy Policy">
      <Section heading="The short version">
        <p>
          You tell {APP_NAME} some personal things so it can introduce you to someone who understands. We
          use that only to run the app. We don't sell your data, there's no advertising, and nothing you
          write is sent to an AI service.
        </p>
      </Section>

      <Section heading="What we collect">
        <List
          items={[
            <>
              <strong className="text-legal">Account:</strong> your email address, the name you choose, and
              your username.
            </>,
            <>
              <strong className="text-legal">What you share to be matched:</strong> the struggles and goals
              you pick, the kind of connection you want, what you can offer and how much capacity you have
              right now, an optional short note about what you wish someone understood, and any extra
              words you type. This can reveal sensitive information about your mental health and
              wellbeing. You choose what to share, and most of it is optional.
            </>,
            <>
              <strong className="text-legal">What you do in the app:</strong> messages, connection
              requests, private journal reflections, Telos posts and specialties, people you block,
              and reports you file.
            </>,
            <>
              <strong className="text-legal">Notification and matching settings:</strong> whether you
              turned on app or email notifications, whether you paused matching, and any limit you set on
              connections. If you turn on app notifications we also store your phone's push token, so we
              can reach your device.
            </>,
            <>
              <strong className="text-legal">A private safety question:</strong> whether you're having
              thoughts of harming yourself. Your answer is visible only to you. It is never shown to
              other members and never affects who you're matched with.
            </>,
            <>
              <strong className="text-legal">Technical data:</strong> basic information such as IP address
              and device type, kept in our hosting and database providers' logs for security and
              reliability.
            </>,
          ]}
        />
      </Section>

      <Section heading="Why we use it">
        <List
          items={[
            "to create your account and sign you in",
            "to match you with someone based on the themes you chose",
            "to deliver your messages and run Telos",
            "to keep people safe: handling reports and blocks, and preventing abuse",
            "to send you the emails you ask for, like sign-in codes",
            "to tell you when someone wants to connect, accepts your request, or messages you, if you turn notifications on",
          ]}
        />
        <p>
          Because some of what you share is sensitive, we rely on your consent to use it. You can
          withdraw consent by editing what you've shared or deleting your account.
        </p>
      </Section>

      <Section heading="Who can see what">
        <List
          items={[
            "Other members can see your display name and username.",
            "A person you're matched with can see the themes you share and the optional note you wrote, before deciding whether to connect.",
            "The person you're talking to sees your messages.",
            "Everyone signed in can see your Telos posts and the specialties you list.",
            "Your reflections and safety answer are visible only to you.",
          ]}
        />
      </Section>

      <Section heading="Services we use">
        <p>
          We use a small number of providers to run the app, and they handle data only on our behalf:
        </p>
        <List
          items={[
            "Supabase — database, sign-in, and real-time messaging, with data stored in the European Union (Ireland)",
            "Vercel — hosting the website",
            "Resend — delivering sign-in and notification emails",
            "Apple Push Notification service — delivering app notifications to your phone, if you turn them on",
          ]}
        />
        <p>
          Some of these providers may process data outside your country, under standard contractual
          clauses or equivalent safeguards where the law requires them. We don't use advertising or
          analytics trackers.
        </p>
      </Section>

      <Section heading="Notifications">
        <p>
          Notifications are off until you say yes, and you can change your mind any time in Settings. They
          tell you that something happened, such as a new request or message, and never include what a
          message says. If you turn on app notifications, your phone's push token is shared with Apple so
          it can deliver them; turning them off, signing out, or deleting your account removes it from our
          records. Email notifications go to the address you signed up with and include a way to turn them
          off.
        </p>
      </Section>

      <Section heading="How long we keep it">
        <p>
          We keep your information while your account exists. When you delete your account in Settings,
          your profile, messages, reflections, and connections are removed. Reports about conduct are
          kept in a limited form so we can protect other members, and backups may hold deleted data for a
          short time before they are overwritten.
        </p>
      </Section>

      <Section heading="Your rights">
        <p>
          Depending on where you live, you can ask to see the data we hold about you, correct it, delete
          it, receive a copy, or object to how we use it, and you can complain to your data protection
          authority. You can edit what you've shared and delete your account yourself in Settings, or
          write to <Mail /> and we'll help.
        </p>
      </Section>

      <Section heading="Security">
        <p>
          Data is encrypted in transit and at rest by our infrastructure providers, and access is
          restricted. No system is perfectly secure, so please don't share anything in the app you
          wouldn't be comfortable having at risk.
        </p>
      </Section>

      <Section heading="Age">
        <p>{APP_NAME} is for people aged {MIN_AGE} and over. We don't knowingly collect data from anyone younger.</p>
      </Section>

      <Section heading="Changes and contact">
        <p>
          If we change how we handle your data, we'll update this page and tell you in the app when the
          change matters. Questions: <Mail />.
        </p>
      </Section>
    </Doc>
  );
}

export function SupportContent() {
  return (
    <Doc title="Support">
      <Section heading="Get in touch">
        <p>
          Email <Mail /> and a person will reply. Include the email address you use to sign in so we can
          find your account.
        </p>
      </Section>

      <Section heading="If you need help right now">
        <p>
          {APP_NAME} isn't a crisis service. If you're thinking about harming yourself or you're in
          danger, please reach out to someone who can help immediately.
        </p>
        <p>
          <Link className="underline underline-offset-2 hover:text-legal" to="/crisis">
            Crisis resources
          </Link>
        </p>
      </Section>

      <Section heading="Common questions">
        <p>
          <strong className="text-legal">I can't sign in.</strong> Use the 6-digit code from the sign-in
          email instead of the link. If nothing arrives, check spam, then ask for a new one.
        </p>
        <p>
          <strong className="text-legal">How do I report or block someone?</strong> Open the conversation
          and tap the menu at the top right. You can also manage blocked people from Settings.
        </p>
        <p>
          <strong className="text-legal">How do I delete my account?</strong> Settings → Delete account.
          It removes your profile, messages, reflections, and connections.
        </p>
        <p>
          <strong className="text-legal">How do I change what I shared?</strong> Settings → Edit what
          you've shared.
        </p>
      </Section>

      <Section heading="Our policies">
        <p>
          <Link className="underline underline-offset-2 hover:text-legal" to="/terms">Terms of Use</Link>
          {" · "}
          <Link className="underline underline-offset-2 hover:text-legal" to="/privacy">Privacy Policy</Link>
        </p>
      </Section>
    </Doc>
  );
}
