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

export function CrisisResources({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="bg-white/12 backdrop-blur-xl border border-white/25 rounded-2xl p-5">
        <p className="font-serif text-white text-xl mb-1">In immediate danger?</p>
        <p className="text-white/75 text-sm leading-relaxed">
          Call your local emergency number — 911 in the US and Canada, 999 in the UK and Ireland,
          112 across the EU, 000 in Australia.
        </p>
      </div>

      {REGIONS.map((r) => (
        <div
          key={r.name}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5"
        >
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
            {r.region}
          </p>
          <p className="font-serif text-white text-lg">{r.name}</p>
          <p className="text-white/70 text-sm mb-3">{r.detail}</p>
          <div className="flex flex-wrap gap-2">
            {r.tel && (
              <a
                href={`tel:${r.tel}`}
                className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white text-sm px-4 py-2 rounded-full hover:bg-white/25 transition-colors"
              >
                <Phone size={14} /> Call
              </a>
            )}
            {r.sms && (
              <a
                href={`sms:${r.sms}?body=HOME`}
                className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white text-sm px-4 py-2 rounded-full hover:bg-white/25 transition-colors"
              >
                <MessageSquare size={14} /> Text
              </a>
            )}
            {r.href && (
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/70 text-sm px-3 py-2 hover:text-white transition-colors"
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
        className="block bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-colors"
      >
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
          Anywhere else
        </p>
        <p className="font-serif text-white text-lg flex items-center gap-2">
          Find a helpline in your country <ExternalLink size={14} className="text-white/60" />
        </p>
        <p className="text-white/70 text-sm">findahelpline.com lists free, confidential support worldwide.</p>
      </a>
    </div>
  );
}
