import type { CollectionId } from "@/content/collections";

type HomeCollectionCoverProps = {
  collectionId: CollectionId;
  className?: string;
};

const COVER_ACCENTS: Record<CollectionId, { a: string; b: string }> = {
  "everyday-russian": { a: "#b08d57", b: "#1a2e44" },
  stories: { a: "#8b6b4a", b: "#2a3f58" },
  telegram: { a: "#9a7b5c", b: "#1f3349" },
  "slow-news": { a: "#a68962", b: "#243a52" },
  dialogues: { a: "#c4a574", b: "#1a2e44" },
  "travel-russian": { a: "#a68962", b: "#2a3f58" },
  culture: { a: "#b5956e", b: "#2d4159" },
};

export function HomeCollectionCover({ collectionId, className = "" }: HomeCollectionCoverProps) {
  const accent = COVER_ACCENTS[collectionId] ?? COVER_ACCENTS["everyday-russian"];

  return (
    <div className={["home-dash-collection-cover", className].join(" ")} aria-hidden>
      <svg viewBox="0 0 320 200" className="home-dash-collection-cover__svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`cover-grad-${collectionId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent.a} stopOpacity="0.22" />
            <stop offset="100%" stopColor={accent.b} stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <rect width="320" height="200" fill={`url(#cover-grad-${collectionId})`} />
        <circle cx="260" cy="42" r="48" fill={accent.a} fillOpacity="0.12" />
        <circle cx="48" cy="168" r="64" fill={accent.b} fillOpacity="0.1" />
        <path
          d="M0 140 Q80 110 160 130 T320 120 V200 H0 Z"
          fill={accent.b}
          fillOpacity="0.06"
        />
        {collectionId === "stories" ? (
          <path
            d="M88 72 L112 56 L136 72 V108 H88 Z"
            stroke={accent.a}
            strokeWidth="1.5"
            fill="none"
            strokeOpacity="0.55"
          />
        ) : null}
        {collectionId === "dialogues" ? (
          <>
            <ellipse cx="118" cy="88" rx="22" ry="14" stroke={accent.a} strokeWidth="1.2" fill="none" strokeOpacity="0.5" />
            <ellipse cx="198" cy="96" rx="26" ry="16" stroke={accent.b} strokeWidth="1.2" fill="none" strokeOpacity="0.45" />
          </>
        ) : null}
        {collectionId === "everyday-russian" ? (
          <rect x="72" y="78" width="56" height="36" rx="2" stroke={accent.a} strokeWidth="1.2" fill="none" strokeOpacity="0.5" />
        ) : null}
      </svg>
    </div>
  );
}
