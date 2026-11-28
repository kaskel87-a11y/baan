import type { ReactNode } from "react";
import { SCENE_ART_ALT, type SceneArtId } from "../data/sceneArt";

/**
 * Original flat cartoons for each scenario. One picture per scene, drawn here
 * (no stock art, no characters from anywhere else).
 */
const ink = "#1c1917";
const teal = "#1f6f64";
const cream = "#f7f1e6";
const sand = "#eadcc8";
const clay = "#d4785a";
const gold = "#e2b15a";
const sky = "#d7ebe6";
const leaf = "#6f9a72";
const blue = "#6f93b8";
const blush = "#f3c7a6";
const hair = "#3a2a22";

function Ground() {
  return (
    <>
      <rect width="320" height="96" fill={cream} />
      <rect y="70" width="320" height="26" fill={sand} />
    </>
  );
}

function Face({ x, y, shirt = teal }: { x: number | string; y: number | string; shirt?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-13" y="16" width="26" height="22" rx="7" fill={shirt} />
      <circle cx="0" cy="0" r="13" fill={blush} />
      <path d="M-12 -1 Q0 -16 12 -1 V2 Q0 -8 -12 2 Z" fill={hair} />
      <circle cx="-4.5" cy="1" r="1.3" fill={ink} />
      <circle cx="4.5" cy="1" r="1.3" fill={ink} />
      <path d="M-4 6.5 Q0 9.5 4 6.5" stroke={ink} strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </g>
  );
}

const DRAWINGS: Record<SceneArtId, ReactNode> = {
  cafe: (
      <>
        <Ground />
        <rect x="36" y="22" width="70" height="52" rx="4" fill={teal} />
        <rect x="46" y="32" width="22" height="28" rx="2" fill={sky} />
        <rect x="74" y="32" width="22" height="42" rx="2" fill="#f3e2c4" />
        <circle cx="85" cy="52" r="2" fill={gold} />
        <rect x="168" y="40" width="36" height="28" rx="4" fill={cream} stroke={ink} strokeWidth="2" />
        <path d="M204 48 h10 a8 8 0 0 1 0 14 h-10" fill="none" stroke={ink} strokeWidth="2" />
        <ellipse cx="186" cy="36" rx="16" ry="6" fill={sand} />
        <rect x="230" y="28" width="8" height="40" fill={leaf} />
        <circle cx="234" cy="24" r="12" fill={leaf} />
      </>
    ),
  order: (
      <>
        <Ground />
        <rect x="128" y="28" width="64" height="46" rx="8" fill={sky} stroke={teal} strokeWidth="3" />
        <rect x="134" y="48" width="52" height="22" rx="4" fill="#c98a55" />
        <rect x="156" y="12" width="6" height="28" rx="2" fill={teal} />
        <circle cx="210" cy="30" r="10" fill={gold} />
        <Face x="70" y="36" />
      </>
  ),
  market: (
      <>
        <Ground />
        <path d="M40 40 H280 L260 22 H60 Z" fill={clay} />
        <path d="M70 40 L82 22 H110 L98 40 Z" fill={gold} />
        <path d="M140 40 L152 22 H180 L168 40 Z" fill={gold} />
        <path d="M210 40 L222 22 H250 L238 40 Z" fill={gold} />
        <rect x="70" y="40" width="180" height="8" fill={teal} />
        <circle cx="100" cy="60" r="12" fill="#e2a13a" />
        <circle cx="132" cy="62" r="10" fill={leaf} />
        <circle cx="160" cy="60" r="12" fill={clay} />
        <ellipse cx="198" cy="62" rx="16" ry="8" fill="#f2d36b" />
      </>
  ),
  street: (
      <>
        <Ground />
        <rect x="70" y="40" width="170" height="28" rx="8" fill={teal} />
        <path d="M110 40 L130 22 H200 L220 40 Z" fill="#2f8f82" />
        <rect x="138" y="26" width="24" height="12" fill={sky} />
        <rect x="170" y="26" width="24" height="12" fill={sky} />
        <circle cx="110" cy="70" r="10" fill={ink} />
        <circle cx="200" cy="70" r="10" fill={ink} />
        <circle cx="110" cy="70" r="4" fill={sand} />
        <circle cx="200" cy="70" r="4" fill={sand} />
      </>
  ),
  seven: (
      <>
        <Ground />
        <rect x="40" y="18" width="120" height="56" rx="4" fill="#2f8f82" />
        <rect x="52" y="30" width="40" height="30" fill={sky} />
        <rect x="100" y="30" width="44" height="44" fill="#f3e2c4" />
        <rect x="190" y="36" width="22" height="34" rx="6" fill={blue} />
        <rect x="196" y="28" width="10" height="10" rx="2" fill={gold} />
        <path d="M230 48 h36 l-4 22 h-28 z" fill={cream} stroke={teal} strokeWidth="2" />
      </>
  ),
  bts: (
      <>
        <rect width="320" height="96" fill={sky} />
        <rect y="72" width="320" height="24" fill={sand} />
        <rect x="28" y="28" width="264" height="40" rx="8" fill={teal} />
        <rect x="48" y="36" width="36" height="20" rx="3" fill={cream} />
        <rect x="100" y="36" width="36" height="20" rx="3" fill={cream} />
        <rect x="152" y="36" width="36" height="20" rx="3" fill={cream} />
        <rect x="204" y="36" width="36" height="20" rx="3" fill={cream} />
        <rect x="250" y="36" width="28" height="20" rx="3" fill="#f3e2c4" />
        <rect x="36" y="68" width="12" height="10" fill={ink} />
        <rect x="272" y="68" width="12" height="10" fill={ink} />
      </>
  ),
  lost: (
      <>
        <Ground />
        <rect x="78" y="18" width="8" height="56" fill={ink} />
        <rect x="86" y="24" width="54" height="16" rx="3" fill={clay} />
        <rect x="40" y="42" width="46" height="16" rx="3" fill={teal} />
        <rect x="180" y="30" width="80" height="44" rx="4" fill={cream} stroke={teal} strokeWidth="3" />
        <path d="M200 34 v36 M220 34 v36 M240 34 v36" stroke={sky} strokeWidth="3" />
        <circle cx="250" cy="52" r="6" fill={clay} />
      </>
  ),
  massage: (
      <>
        <Ground />
        <rect x="70" y="48" width="160" height="16" rx="8" fill={teal} />
        <circle cx="86" cy="44" r="12" fill={blush} />
        <path d="M76 38 Q86 26 98 38" fill={hair} />
        <rect x="96" y="42" width="90" height="16" rx="8" fill="#3d8f84" />
        <Face x="250" y="28" shirt={clay} />
      </>
  ),
  clinic: (
      <>
        <Ground />
        <rect x="64" y="22" width="150" height="52" rx="4" fill={teal} />
        <rect x="78" y="34" width="36" height="28" fill={sky} />
        <rect x="128" y="34" width="36" height="40" fill="#f3e2c4" />
        <rect x="178" y="30" width="22" height="22" rx="3" fill={cream} />
        <path d="M189 34 v14 M182 41 h14" stroke={clay} strokeWidth="3" strokeLinecap="round" />
        <rect x="244" y="40" width="22" height="30" rx="4" fill={cream} stroke={ink} strokeWidth="2" />
        <rect x="248" y="34" width="14" height="8" rx="2" fill={teal} />
      </>
  ),
  meal: (
      <>
        <Ground />
        <ellipse cx="150" cy="58" rx="54" ry="18" fill={cream} stroke={teal} strokeWidth="3" />
        <ellipse cx="150" cy="54" rx="36" ry="12" fill={gold} />
        <circle cx="134" cy="52" r="6" fill={leaf} />
        <circle cx="166" cy="50" r="7" fill={clay} />
        <rect x="214" y="28" width="8" height="40" rx="3" fill={ink} />
        <ellipse cx="218" cy="66" rx="10" ry="5" fill={ink} />
      </>
  ),
  chat: (
      <>
        <Ground />
        <Face x="90" y="40" />
        <Face x="220" y="40" shirt={clay} />
        <rect x="112" y="16" width="36" height="18" rx="8" fill={cream} stroke={teal} strokeWidth="2" />
        <rect x="168" y="16" width="36" height="18" rx="8" fill={cream} stroke={clay} strokeWidth="2" />
      </>
  ),
  compliments: (
      <>
        <Ground />
        <Face x="78" y="42" />
        <Face x="242" y="42" shirt={clay} />
        <path d="M160 18 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z" fill={gold} />
        <rect x="148" y="50" width="24" height="20" rx="3" fill={teal} />
        <path d="M148 54 L138 62 V50 Z" fill={teal} />
        <path d="M172 54 L182 62 V50 Z" fill={teal} />
      </>
  ),
  hotel: (
      <>
        <Ground />
        <rect x="40" y="36" width="16" height="34" rx="3" fill={teal} />
        <rect x="56" y="44" width="110" height="26" rx="6" fill={sky} />
        <rect x="64" y="36" width="36" height="18" rx="6" fill={cream} />
        <rect x="200" y="36" width="70" height="36" rx="6" fill={gold} />
        <circle cx="218" cy="54" r="6" fill={cream} />
        <rect x="232" y="50" width="24" height="4" rx="2" fill={cream} />
      </>
  ),
  quiet: (
      <>
        <Ground />
        <circle cx="150" cy="42" r="24" fill={blush} />
        <circle cx="141" cy="36" r="2.3" fill={ink} />
        <circle cx="159" cy="36" r="2.3" fill={ink} />
        <circle cx="150" cy="50" r="3" fill={ink} />
        <rect x="162" y="38" width="12" height="36" rx="6" fill={sand} transform="rotate(28 168 56)" />
        <circle cx="175" cy="36" r="7" fill={sand} transform="rotate(28 168 56)" />
      </>
  ),
  shop: (
      <>
        <Ground />
        <path d="M150 18 l16 10 -8 8 v36 h-36 V36 l-8 -8 z" fill={teal} />
        <path d="M146 18 h16" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        <circle cx="154" cy="16" r="4" fill={ink} />
        <circle cx="230" cy="40" r="16" fill={clay} />
        <circle cx="86" cy="48" r="14" fill={gold} />
      </>
  ),
  food: (
      <>
        <Ground />
        <path d="M90 58 Q160 92 230 58" fill={ink} />
        <path d="M100 56 Q160 78 220 56" fill={gold} />
        <circle cx="140" cy="54" r="5" fill={leaf} />
        <circle cx="168" cy="52" r="5" fill={clay} />
        <rect x="250" y="30" width="8" height="36" fill={ink} />
        <rect x="70" y="24" width="180" height="8" fill={clay} />
      </>
  ),
  laundry: (
      <>
        <Ground />
        <path d="M100 40 h120 l-12 32 H112 Z" fill={teal} />
        <rect x="118" y="28" width="36" height="16" rx="3" fill={cream} />
        <rect x="150" y="32" width="36" height="14" rx="3" fill={sky} />
        <rect x="132" y="46" width="40" height="12" rx="3" fill={gold} />
      </>
  ),
  haircut: (
      <>
        <Ground />
        <rect x="70" y="36" width="70" height="28" rx="8" fill={teal} />
        <rect x="78" y="22" width="40" height="20" rx="6" fill="#2f8f82" />
        <rect x="96" y="64" width="10" height="12" fill={ink} />
        <g transform="translate(200 48) rotate(-30)">
          <rect x="-28" y="-3" width="36" height="6" rx="2" fill={ink} />
          <circle cx="12" cy="0" r="10" fill="none" stroke={ink} strokeWidth="3" />
        </g>
        <g transform="translate(214 48) rotate(30)">
          <rect x="-28" y="-3" width="36" height="6" rx="2" fill={ink} />
          <circle cx="12" cy="0" r="10" fill="none" stroke={ink} strokeWidth="3" />
        </g>
      </>
  ),
  phone: (
      <>
        <Ground />
        <rect x="118" y="16" width="52" height="68" rx="8" fill={teal} />
        <rect x="124" y="24" width="40" height="44" rx="3" fill={sky} />
        <circle cx="144" cy="76" r="3" fill={cream} />
        <rect x="196" y="40" width="36" height="26" rx="3" fill={gold} />
        <rect x="202" y="46" width="10" height="14" fill={cream} />
      </>
  ),
  exchange: (
      <>
        <Ground />
        <rect x="70" y="30" width="80" height="44" rx="4" transform="rotate(-8 110 52)" fill={leaf} />
        <circle cx="110" cy="50" r="10" fill={cream} />
        <rect x="168" y="28" width="80" height="44" rx="4" transform="rotate(8 208 50)" fill={gold} />
        <circle cx="208" cy="50" r="10" fill={cream} />
      </>
  ),
  tuktuk: (
      <>
        <Ground />
        <path d="M70 34 H200 L230 58 H70 Z" fill={teal} />
        <path d="M90 34 L110 18 H190 L200 34 Z" fill={gold} />
        <rect x="118" y="38" width="40" height="16" fill={sky} />
        <circle cx="100" cy="70" r="10" fill={ink} />
        <circle cx="160" cy="70" r="10" fill={ink} />
        <circle cx="214" cy="68" r="8" fill={ink} />
        <circle cx="100" cy="70" r="4" fill={sand} />
        <circle cx="160" cy="70" r="4" fill={sand} />
      </>
  ),
  taxi: (
      <>
        <Ground />
        <rect x="78" y="42" width="164" height="26" rx="6" fill={gold} />
        <path d="M118 42 L136 24 H196 L214 42 Z" fill="#f0c56e" />
        <rect x="146" y="12" width="28" height="12" rx="2" fill={teal} />
        <rect x="144" y="28" width="28" height="12" fill={sky} />
        <circle cx="118" cy="70" r="10" fill={ink} />
        <circle cx="204" cy="70" r="10" fill={ink} />
        <circle cx="118" cy="70" r="4" fill={sand} />
        <circle cx="204" cy="70" r="4" fill={sand} />
      </>
  ),
  temple: (
      <>
        <Ground />
        <path d="M40 62 L120 28 L200 62 Z" fill={clay} />
        <path d="M60 50 L120 26 L180 50 Z" fill={gold} />
        <rect x="112" y="58" width="16" height="14" fill={teal} />
        <rect x="220" y="40" width="28" height="32" fill={cream} stroke={gold} strokeWidth="3" />
        <path d="M214 40 H254 L234 22 Z" fill={gold} />
        <circle cx="234" cy="18" r="4" fill={clay} />
      </>
  ),
  "mai-jing": (
      <>
        <Ground />
        <circle cx="112" cy="42" r="22" fill={cream} stroke={teal} strokeWidth="3" />
        <path d="M102 42 h20" stroke={teal} strokeWidth="4" strokeLinecap="round" />
        <path d="M198 28 l28 28 M226 28 l-28 28" fill="none" stroke={clay} strokeWidth="6" strokeLinecap="round" />
      </>
  ),
  everyday: (
      <>
        <Ground />
        <rect x="36" y="22" width="70" height="36" rx="16" fill={teal} />
        <circle cx="58" cy="64" r="6" fill={teal} />
        <rect x="124" y="18" width="72" height="36" rx="16" fill={clay} />
        <circle cx="160" cy="60" r="6" fill={clay} />
        <rect x="214" y="26" width="70" height="34" rx="16" fill={gold} />
        <circle cx="246" cy="66" r="6" fill={gold} />
      </>
  ),
  likes: (
      <>
        <Ground />
        <path d="M58 40 c0 -10 16 -10 16 2 c0 -12 16 -12 16 2 c0 16 -16 26 -16 26 c0 0 -16 -10 -16 -28 z" fill={clay} />
        <circle cx="160" cy="42" r="18" fill={blush} />
        <circle cx="153" cy="40" r="1.5" fill={ink} />
        <circle cx="167" cy="40" r="1.5" fill={ink} />
        <path d="M154 48 h12" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="246" cy="42" r="18" fill={blush} />
        <circle cx="239" cy="40" r="1.5" fill={ink} />
        <circle cx="253" cy="40" r="1.5" fill={ink} />
        <path d="M240 48 Q246 54 252 48" stroke={ink} strokeWidth="1.5" fill="none" />
      </>
  ),
  days: (
      <>
        <Ground />
        <circle cx="64" cy="36" r="16" fill={gold} />
        <rect x="130" y="20" width="70" height="56" rx="6" fill={cream} stroke={teal} strokeWidth="3" />
        <rect x="130" y="20" width="70" height="16" fill={teal} />
        <circle cx="152" cy="52" r="5" fill={gold} />
        <circle cx="170" cy="52" r="5" fill={clay} />
        <circle cx="188" cy="52" r="5" fill={sky} />
        <rect x="230" y="36" width="50" height="6" rx="3" fill={teal} />
      </>
  ),
  "massage-shop": (
      <>
        <Ground />
        <rect x="48" y="36" width="90" height="32" rx="16" fill={sky} stroke={teal} strokeWidth="3" />
        <rect x="168" y="32" width="100" height="36" rx="6" fill={teal} />
        <path d="M176 44 h84 M176 54 h84" stroke={cream} strokeWidth="3" />
      </>
  ),
  body: (
      <>
        <Ground />
        <circle cx="70" cy="30" r="12" fill={blush} />
        <rect x="60" y="44" width="20" height="26" rx="8" fill={teal} />
        <circle cx="160" cy="28" r="14" fill={blush} />
        <rect x="142" y="44" width="36" height="26" rx="10" fill={clay} />
        <circle cx="246" cy="30" r="12" fill={blush} />
        <rect x="232" y="44" width="28" height="26" rx="8" fill={gold} />
      </>
  ),
  looks: (
      <>
        <Ground />
        <circle cx="150" cy="40" r="22" fill={blush} />
        <path d="M130 32 Q150 12 172 32 V38 Q150 22 130 38 Z" fill={hair} />
        <circle cx="142" cy="40" r="2" fill={ink} />
        <circle cx="158" cy="40" r="2" fill={ink} />
        <path d="M144 50 Q150 55 156 50" stroke={ink} strokeWidth="1.5" fill="none" />
        <path d="M210 24 l6 12 12 2 -10 8 3 12 -11 -7 -11 7 3 -12 -10 -8 12 -2 z" fill={gold} />
      </>
  ),
  sweets: (
      <>
        <Ground />
        <path d="M70 36 h36 l-4 28 h-28 z" fill={cream} stroke={teal} strokeWidth="2" />
        <ellipse cx="88" cy="36" rx="18" ry="6" fill={gold} />
        <path d="M130 40 h36 l-4 24 h-28 z" fill={cream} stroke={clay} strokeWidth="2" />
        <ellipse cx="148" cy="40" rx="18" ry="6" fill="#f2d36b" />
        <circle cx="230" cy="36" r="16" fill={sky} />
        <path d="M214 40 h32 l-6 22 h-20 z" fill={gold} />
      </>
  ),
  colours: (
      <>
        <Ground />
        <circle cx="62" cy="48" r="17" fill="#c0453a" />
        <circle cx="112" cy="44" r="15" fill="#2f4c9a" />
        <circle cx="160" cy="48" r="17" fill="#8ec5e8" />
        <circle cx="208" cy="44" r="15" fill={gold} />
        <circle cx="256" cy="48" r="17" fill="#3f9a5a" />
        <path d="M44 74 h232" stroke={ink} strokeWidth="2" strokeLinecap="round" opacity="0.25" />
      </>
  ),
  meat: (
      <>
        <Ground />
        <circle cx="96" cy="46" r="24" fill="#f2b6a8" />
        <path d="M78 28 l-8 -12 l18 6 z M114 28 l8 -12 l-18 6 z" fill="#e59a8a" />
        <ellipse cx="96" cy="54" rx="11" ry="8" fill="#e59a8a" />
        <circle cx="92" cy="54" r="1.6" fill={ink} />
        <circle cx="100" cy="54" r="1.6" fill={ink} />
        <circle cx="86" cy="40" r="2" fill={ink} />
        <circle cx="106" cy="40" r="2" fill={ink} />
        <path d="M190 40 q10 -16 36 -12 q18 4 16 24 q-4 18 -32 14 q-26 -4 -20 -26 z" fill={clay} />
        <circle cx="222" cy="46" r="6" fill={cream} />
        <rect x="236" y="42" width="22" height="7" rx="3" fill={cream} />
        <circle cx="262" cy="42" r="5" fill={cream} />
        <circle cx="262" cy="50" r="5" fill={cream} />
      </>
  ),
  juice: (
      <>
        <Ground />
        <path d="M118 26 h54 l-6 44 h-42 z" fill={cream} stroke={teal} strokeWidth="3" />
        <path d="M121 40 h48 l-4 28 h-40 z" fill="#f0a030" />
        <path d="M160 12 l6 30" stroke={clay} strokeWidth="4" strokeLinecap="round" />
        <circle cx="214" cy="52" r="20" fill="#f0a030" />
        <path d="M214 32 v40 M194 52 h40 M200 38 l28 28 M228 38 l-28 28" stroke={cream} strokeWidth="2" />
        <circle cx="214" cy="52" r="20" fill="none" stroke="#d8801a" strokeWidth="3" />
        <path d="M232 28 q8 -10 18 -6 q-4 10 -14 10 z" fill={leaf} />
      </>
  ),
  "ao-yaak": (
      <>
        <Ground />
        <rect x="40" y="16" width="100" height="52" rx="14" fill={cream} stroke={teal} strokeWidth="3" />
        <path d="M60 68 l-6 14 l22 -14 z" fill={cream} stroke={teal} strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="90" cy="48" rx="28" ry="9" fill={sand} stroke={teal} strokeWidth="2" />
        <ellipse cx="90" cy="44" rx="18" ry="6" fill={gold} />
        <circle cx="80" cy="43" r="4" fill={clay} />
        <rect x="180" y="16" width="100" height="52" rx="14" fill={sky} stroke={clay} strokeWidth="3" />
        <path d="M260 68 l6 14 l-22 -14 z" fill={sky} stroke={clay} strokeWidth="3" strokeLinejoin="round" />
        <path d="M218 28 v26 M224 28 v10 M212 28 v10 M212 38 q6 6 12 0 M218 54 v8" stroke={ink} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M250 26 v34" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        <path d="M250 26 q8 8 0 18" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      </>
  ),
  arai: (
      <>
        <Ground />
        <rect x="34" y="28" width="32" height="20" rx="8" fill={sand} stroke={teal} strokeWidth="2" />
        <rect x="86" y="10" width="148" height="58" rx="16" fill={cream} stroke={teal} strokeWidth="3" />
        <path d="M148 68 l-10 16 l26 -16 z" fill={cream} stroke={teal} strokeWidth="3" strokeLinejoin="round" />
        <path d="M148 28 C148 18 174 18 174 30 C174 40 158 42 158 52" fill="none" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="158" cy="61" r="3.4" fill={ink} />
        <rect x="254" y="22" width="36" height="22" rx="8" fill={sky} stroke={clay} strokeWidth="2" />
      </>
  ),
  swears: (
      <>
        <Ground />
        <Face x="96" y="38" />
        <path d="M112 48 Q140 40 150 28" stroke={blush} strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="154" cy="24" r="6" fill={blush} />
        <path d="M190 22 l14 10 16 -12 -4 18 16 6 -18 4 4 16 -14 -12 -16 8 2 -16 -16 -6 16 -4 z" fill={gold} />
        <circle cx="214" cy="36" r="4" fill={cream} />
      </>
  ),
  leave: (
      <>
        <Ground />
        <rect x="36" y="18" width="64" height="56" rx="4" fill={teal} />
        <rect x="48" y="28" width="36" height="46" rx="2" fill="#f3e2c4" />
        <circle cx="76" cy="52" r="2" fill={gold} />
        <Face x="180" y="36" shirt={clay} />
        <path d="M196 30 Q214 18 206 40" stroke={blush} strokeWidth="6" fill="none" strokeLinecap="round" />
      </>
  ),
};

export function SceneArt({ id, variant = "banner" }: { id: string; variant?: "banner" | "card" }) {
  const node = DRAWINGS[id as SceneArtId];
  const alt = SCENE_ART_ALT[id as SceneArtId];
  if (!node || !alt) return null;
  return (
    <svg
      viewBox="0 0 320 96"
      role="img"
      aria-label={alt}
      preserveAspectRatio="xMidYMid slice"
      className={variant === "banner" ? "h-24 w-full rounded-2xl bg-[#f7f1e6]" : "block h-16 w-full bg-[#f7f1e6]"}
    >
      {node}
    </svg>
  );
}
