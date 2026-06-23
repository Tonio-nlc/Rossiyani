import type { ReactElement } from "react";

import type { CollectionId } from "@/content/collections";

type HomeCollectionCoverProps = {
  collectionId: CollectionId;
  className?: string;
};

const NAVY = "#1a2e44";
const GOLD = "#b08d57";
const CREAM = "#f5f3ee";
const WARM = "#e8dfd0";

function EverydayRussianIllustration() {
  return (
    <>
      <rect width="320" height="200" fill={`url(#grad-everyday)`} />
      <rect x="0" y="128" width="320" height="72" fill={NAVY} fillOpacity="0.06" />
      <rect x="48" y="54" width="120" height="88" rx="3" fill={CREAM} fillOpacity="0.9" stroke={NAVY} strokeOpacity="0.14" />
      <rect x="58" y="64" width="44" height="52" rx="1" fill={WARM} fillOpacity="0.55" />
      <line x1="68" y1="74" x2="92" y2="74" stroke={NAVY} strokeOpacity="0.12" strokeWidth="2" />
      <line x1="68" y1="84" x2="88" y2="84" stroke={NAVY} strokeOpacity="0.1" strokeWidth="2" />
      <rect x="112" y="108" width="48" height="22" rx="2" fill={GOLD} fillOpacity="0.35" stroke={GOLD} strokeOpacity="0.5" />
      <path d="M124 118h24M136 112v12" stroke={NAVY} strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="210" cy="118" rx="38" ry="14" fill={GOLD} fillOpacity="0.2" stroke={GOLD} strokeOpacity="0.45" />
      <path d="M188 118c8-10 16-10 24 0" stroke={NAVY} strokeOpacity="0.2" strokeWidth="1.2" fill="none" />
      <circle cx="248" cy="72" r="18" fill={GOLD} fillOpacity="0.25" />
      <path d="M236 72h24M248 60v24" stroke={NAVY} strokeOpacity="0.2" strokeWidth="1" />
    </>
  );
}

function StoriesIllustration() {
  return (
    <>
      <rect width="320" height="200" fill={`url(#grad-stories)`} />
      <rect x="72" y="48" width="112" height="88" rx="2" fill={CREAM} stroke={NAVY} strokeOpacity="0.16" />
      <path d="M84 60h88M84 76h72M84 92h80M84 108h56" stroke={NAVY} strokeOpacity="0.14" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M184 48v88l-12-8-12 8V48z" fill={GOLD} fillOpacity="0.22" stroke={GOLD} strokeOpacity="0.45" />
      <path d="M208 92c12-4 20 2 28 12" stroke={GOLD} strokeOpacity="0.55" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <line x1="220" y1="88" x2="248" y2="72" stroke={NAVY} strokeOpacity="0.25" strokeWidth="1.2" />
      <ellipse cx="248" cy="120" rx="10" ry="16" fill={GOLD} fillOpacity="0.35" />
      <path d="M248 104v8c0 4-4 8-8 8" stroke={GOLD} strokeOpacity="0.6" strokeWidth="1" fill="none" />
      <circle cx="248" cy="100" r="5" fill={GOLD} fillOpacity="0.7" />
    </>
  );
}

function DialoguesIllustration() {
  return (
    <>
      <rect width="320" height="200" fill={`url(#grad-dialogues)`} />
      <circle cx="108" cy="98" r="28" fill={CREAM} stroke={NAVY} strokeOpacity="0.14" />
      <circle cx="212" cy="108" r="32" fill={WARM} fillOpacity="0.7" stroke={NAVY} strokeOpacity="0.12" />
      <ellipse cx="88" cy="148" rx="36" ry="10" fill={NAVY} fillOpacity="0.06" />
      <ellipse cx="228" cy="154" rx="40" ry="10" fill={NAVY} fillOpacity="0.06" />
      <path d="M56 72h52l-8 12H64z" fill="white" fillOpacity="0.75" stroke={GOLD} strokeOpacity="0.45" />
      <path d="M168 58h64l-10 14h-54z" fill="white" fillOpacity="0.8" stroke={NAVY} strokeOpacity="0.18" />
      <path d="M72 80h28M180 66h40" stroke={NAVY} strokeOpacity="0.2" strokeWidth="1.2" strokeLinecap="round" />
    </>
  );
}

function NewsIllustration() {
  return (
    <>
      <rect width="320" height="200" fill={`url(#grad-news)`} />
      <rect x="64" y="44" width="192" height="120" rx="2" fill={CREAM} stroke={NAVY} strokeOpacity="0.14" />
      <rect x="76" y="56" width="72" height="48" fill={WARM} fillOpacity="0.55" />
      <rect x="156" y="56" width="88" height="8" rx="1" fill={NAVY} fillOpacity="0.18" />
      <rect x="156" y="70" width="76" height="6" rx="1" fill={NAVY} fillOpacity="0.1" />
      <rect x="156" y="82" width="80" height="6" rx="1" fill={NAVY} fillOpacity="0.1" />
      <rect x="76" y="112" width="168" height="6" rx="1" fill={NAVY} fillOpacity="0.08" />
      <rect x="76" y="124" width="148" height="6" rx="1" fill={GOLD} fillOpacity="0.35" />
      <text x="82" y="86" fill={NAVY} fillOpacity="0.35" fontFamily="Georgia, serif" fontSize="11" fontWeight="700">
        НОВОСТИ
      </text>
    </>
  );
}

function DefaultIllustration() {
  return (
    <>
      <rect width="320" height="200" fill={`url(#grad-default)`} />
      <circle cx="160" cy="100" r="40" fill={GOLD} fillOpacity="0.15" />
    </>
  );
}

const ILLUSTRATIONS: Partial<Record<CollectionId, () => ReactElement>> = {
  "everyday-russian": EverydayRussianIllustration,
  stories: StoriesIllustration,
  dialogues: DialoguesIllustration,
  "slow-news": NewsIllustration,
};

export function HomeCollectionCover({ collectionId, className = "" }: HomeCollectionCoverProps) {
  const Illustration = ILLUSTRATIONS[collectionId] ?? DefaultIllustration;

  return (
    <div className={["home-ws-collection-cover", className].join(" ")} aria-hidden>
      <svg viewBox="0 0 320 200" className="home-ws-collection-cover__svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="grad-everyday" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7f1e8" />
            <stop offset="100%" stopColor="#e6dcc8" />
          </linearGradient>
          <linearGradient id="grad-stories" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#efe8dc" />
            <stop offset="100%" stopColor="#f8f5ef" />
          </linearGradient>
          <linearGradient id="grad-dialogues" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f3efe8" />
            <stop offset="100%" stopColor="#e4ddd2" />
          </linearGradient>
          <linearGradient id="grad-news" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#eceae6" />
            <stop offset="100%" stopColor="#f6f3ed" />
          </linearGradient>
          <linearGradient id="grad-default" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={CREAM} />
            <stop offset="100%" stopColor={WARM} />
          </linearGradient>
        </defs>
        <Illustration />
      </svg>
    </div>
  );
}
