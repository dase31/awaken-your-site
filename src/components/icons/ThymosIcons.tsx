import type { SVGProps } from "react";

// Small custom-drawn icons for the sky-and-glass look. Filled shapes are
// tinted with the accent of the soft circle they sit in; the tab icons are
// plain strokes that inherit the tab's colour.

type IconProps = SVGProps<SVGSVGElement>;

export function SunIcon({ color = "#767a5c", ...props }: IconProps & { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="4.3" fill={color} />
      <g stroke={color} strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="4.2" />
        <line x1="12" y1="19.8" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4.2" y2="12" />
        <line x1="19.8" y1="12" x2="22" y2="12" />
        <line x1="4.9" y1="4.9" x2="6.4" y2="6.4" />
        <line x1="17.6" y1="17.6" x2="19.1" y2="19.1" />
        <line x1="4.9" y1="19.1" x2="6.4" y2="17.6" />
        <line x1="17.6" y1="6.4" x2="19.1" y2="4.9" />
      </g>
    </svg>
  );
}

/** Two overlapping circles: two people, side by side. */
export function CircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="9" cy="9" r="5" fill="#7693BB" />
      <circle cx="15" cy="12" r="5" fill="#5c7ba3" />
    </svg>
  );
}

/** An open book, for the journal. */
export function BookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 5c3-1.5 6-1.5 8 0v13c-2-1.5-5-1.5-8 0Z" fill="#9a8356" />
      <path d="M20 5c-3-1.5-6-1.5-8 0v13c2-1.5 5-1.5 8 0Z" fill="#7a6a4a" />
    </svg>
  );
}

const tabProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function TabHomeIcon(props: IconProps) {
  return (
    <svg {...tabProps} {...props}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function TabChatIcon(props: IconProps) {
  return (
    <svg {...tabProps} {...props}>
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function TabConnectIcon(props: IconProps) {
  return (
    <svg {...tabProps} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9" r="2.6" />
      <path d="M15.5 14c2.6.3 4.5 2.4 4.5 5.1" />
    </svg>
  );
}

/** Two rings: a target, for "purpose in action". */
export function TabTelosIcon(props: IconProps) {
  return (
    <svg {...tabProps} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

/** A small ring with a dot: someone reaching out, for a request for help. */
export function AskIcon({ color = "currentColor", ...props }: IconProps & { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.6" fill={color} />
    </svg>
  );
}

/** A painterly tree for empty states. */
export function TreeArt(props: IconProps) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <ellipse cx="60" cy="104" rx="34" ry="6" fill="#767a5c" opacity="0.25" />
      <path d="M60 104V66" stroke="#6b5c3c" strokeWidth="7" strokeLinecap="round" />
      <path d="M60 86c-8-2-14-9-13-16" stroke="#6b5c3c" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M60 78c7-2 12-8 11-14" stroke="#6b5c3c" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="60" cy="48" r="26" fill="#909473" />
      <circle cx="42" cy="58" r="17" fill="#9ba47a" />
      <circle cx="78" cy="56" r="18" fill="#767a5c" />
      <circle cx="60" cy="34" r="16" fill="#a8b088" />
    </svg>
  );
}
