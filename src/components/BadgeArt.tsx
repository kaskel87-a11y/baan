import { Ear, Headphones, Lock, Mic, Trophy, type LucideIcon } from "lucide-react";
import type { BadgeColor, BadgeIcon, Milestone } from "../data/rewards";

/** Flat sticker badges in Baan's palette. Locked ones are a quiet silhouette; the next one gets a dashed ring. */
const FILL: Record<BadgeColor, { bg: string; fg: string }> = {
  clay: { bg: "#d4785a", fg: "#fffaf3" },
  teal: { bg: "#1f6f64", fg: "#f7f6f3" },
  gold: { bg: "#e2b15a", fg: "#1c1917" },
  leaf: { bg: "#5a8a5e", fg: "#fbfaf6" },
  blue: { bg: "#5f84ab", fg: "#fbfaf6" },
};
const ICONS: Record<BadgeIcon, LucideIcon> = { mic: Mic, headphones: Headphones, ear: Ear, trophy: Trophy };

export function BadgeArt({
  m,
  locked = false,
  next = false,
  className = "w-full",
}: {
  m: Milestone;
  locked?: boolean;
  next?: boolean;
  className?: string;
}) {
  const c = FILL[m.color];
  const Icon = m.icon ? ICONS[m.icon] : null;
  const size = m.mark ? (m.mark.length >= 3 ? 36 : m.mark.length === 2 ? 44 : 52) : 0;
  const bg = locked ? "#e9e4da" : c.bg;
  const fg = locked ? "#c6bfb2" : c.fg;
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={locked ? `Locked badge: ${m.title}` : `Badge: ${m.title}`}>
      <circle cx="60" cy="63" r="54" fill="#1c1917" opacity={locked ? 0.04 : 0.1} />
      <circle cx="60" cy="60" r="54" fill={locked ? "#f3f0ea" : "#ffffff"} stroke={next ? "#1f6f64" : "#e4dfd6"} strokeWidth={next ? 3 : 2} strokeDasharray={next ? "6 5" : undefined} />
      <circle cx="60" cy="60" r="47" fill={bg} />
      <circle cx="60" cy="60" r="40" fill="none" stroke={fg} strokeOpacity={locked ? 0.7 : 0.45} strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" />
      {m.mark ? (
        <>
          <text x="60" y={m.unit ? 66 : 72} textAnchor="middle" fontSize={size} fill={fg} className="font-display" fontWeight="700">
            {m.mark}
          </text>
          {m.unit ? (
            <text x="60" y="85" textAnchor="middle" fontSize="11" letterSpacing="1.2" fill={fg} fillOpacity={locked ? 1 : 0.9} fontWeight="600">
              {m.unit.toUpperCase()}
            </text>
          ) : null}
        </>
      ) : Icon ? (
        <>
          <Icon x={36} y={32} width={48} height={48} color={fg} strokeWidth={1.8} />
          {m.unit ? (
            <text x="60" y="94" textAnchor="middle" fontSize="10" letterSpacing="1.1" fill={fg} fillOpacity={locked ? 1 : 0.9} fontWeight="600">
              {m.unit.toUpperCase()}
            </text>
          ) : null}
        </>
      ) : null}
      {locked ? (
        <g>
          <circle cx="94" cy="94" r="13" fill="#ffffff" stroke="#e4dfd6" strokeWidth="2" />
          <Lock x={86} y={86} width={16} height={16} color="#78716c" strokeWidth={2} />
        </g>
      ) : (
        <g fill="#e2b15a">
          <path d="M96 22 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6z" />
          <path d="M20 84 l1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8 -4.4 -4.4 -1.8 4.4 -1.8z" opacity="0.8" />
        </g>
      )}
    </svg>
  );
}
