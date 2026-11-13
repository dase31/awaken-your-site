import { Phone, MessageSquare, ExternalLink } from "lucide-react";

// Numbers checked against each service's own published contact details.
// Keep this list short and reliable rather than long and out of date.
const REGIONS: {
  region: string;
  name: string;
  detail: string;
  tel?: string;
  sms?: string;
  href?: string;
}[] = [
  { region: "United States and Canada", name: "988 Suicide & Crisis Lifeline", detail: "Call or text 988, any time", tel: "988", href: "https://988lifeline.org" },
  { region: "United States", name: "Crisis Text Line", detail: "Text HOME to 741741", sms: "741741" },
  { region: "United Kingdom and Ireland", name: "Samaritans", detail: "Call 116 123, free, any time", tel: "116123", href: "https://www.samaritans.org" },
  { region: "Australia", name: "Lifeline", detail: "Call 13 11 14", tel: "131114", href: "https://www.lifeline.org.au" },
];

const row = "th-glass-row border border-[color:var(--th-line)] p-5 text-[color:var(--th-ink)]";
const action =
  "inline-flex items-center gap-2 rounded-full bg-[color:var(--th-ink)] px-4 py-2 text-sm font-medium text-[color:var(--th-paper)] transition-opacity hover:opacity-90";

export function CrisisResources({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className={row}>
        <p className="th-h1 mb-1 text-xl" style={{ fontWeight: 400 }}>In immediate danger?</p>
        <p className="th-sub">
          Call your local emergency number — 911 in the US and Canada, 999 in the UK and Ireland,
          112 across the EU, 000 in Australia.
        </p>
      </div>

      {REGIONS.map((r) => (
        <div key={r.name} className={row}>
          <p className="th-eyebrow mb-1">{r.region}</p>
          <p className="th-h1 text-lg" style={{ fontWeight: 400 }}>{r.name}</p>
          <p className="th-sub mb-3">{r.detail}</p>
          <div className="flex flex-wrap items-center gap-2">
            {r.tel && (
              <a href={`tel:${r.tel}`} className={action}>
                <Phone size={14} /> Call
              </a>
            )}
            {r.sms && (
              <a href={`sms:${r.sms}?body=HOME`} className={action}>
                <MessageSquare size={14} /> Text
              </a>
            )}
            {r.href && (
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[color:var(--th-text-2)] hover:text-[color:var(--th-ink)]"
              >
                Website <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      ))}

      <a
        href="https://findahelpline.com"
        target="_blank"
        rel="noopener noreferrer"
        className={`${row} block transition-colors hover:bg-white/90`}
      >
        <p className="th-eyebrow mb-1">Anywhere else</p>
        <p className="th-h1 flex items-center gap-2 text-lg" style={{ fontWeight: 400 }}>
          Find a helpline in your country <ExternalLink size={14} className="text-[color:var(--th-text-3)]" />
        </p>
        <p className="th-sub">findahelpline.com lists free, confidential support worldwide.</p>
      </a>
    </div>
  );
}
