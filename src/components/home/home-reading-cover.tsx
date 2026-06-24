import type { CollectionId } from "@/content/collections";

type HomeReadingCoverProps = {
  collectionId?: CollectionId | null;
  className?: string;
};

const BLUE = "#0058BE";
const BLUE_LIGHT = "#3B82F6";
const SURFACE = "#EFF6FF";

function ReadingIllustration({ collectionId }: { collectionId: CollectionId | null }) {
  if (collectionId === "stories") {
    return (
      <>
        <rect width="480" height="360" fill="url(#reading-grad)" />
        <rect x="80" y="72" width="220" height="28" rx="14" fill={BLUE} fillOpacity="0.12" />
        <rect x="80" y="116" width="180" height="12" rx="6" fill={BLUE} fillOpacity="0.18" />
        <rect x="80" y="140" width="200" height="12" rx="6" fill={BLUE} fillOpacity="0.12" />
        <rect x="80" y="164" width="140" height="12" rx="6" fill={BLUE} fillOpacity="0.1" />
        <circle cx="360" cy="120" r="48" fill={BLUE_LIGHT} fillOpacity="0.2" />
        <circle cx="360" cy="120" r="28" fill={BLUE} fillOpacity="0.35" />
      </>
    );
  }

  if (collectionId === "dialogues") {
    return (
      <>
        <rect width="480" height="360" fill="url(#reading-grad)" />
        <rect x="72" y="96" width="160" height="88" rx="20" fill={SURFACE} stroke={BLUE} strokeOpacity="0.15" strokeWidth="2" />
        <rect x="248" y="112" width="160" height="88" rx="20" fill="#fff" stroke={BLUE_LIGHT} strokeOpacity="0.25" strokeWidth="2" />
        <rect x="96" y="120" width="88" height="10" rx="5" fill={BLUE} fillOpacity="0.2" />
        <rect x="96" y="140" width="64" height="8" rx="4" fill={BLUE} fillOpacity="0.12" />
        <rect x="272" y="136" width="88" height="10" rx="5" fill={BLUE_LIGHT} fillOpacity="0.35" />
        <rect x="272" y="156" width="72" height="8" rx="4" fill={BLUE} fillOpacity="0.15" />
      </>
    );
  }

  return (
    <>
      <rect width="480" height="360" fill="url(#reading-grad)" />
      <rect x="64" y="80" width="352" height="200" rx="24" fill="#fff" fillOpacity="0.7" stroke={BLUE} strokeOpacity="0.12" strokeWidth="2" />
      <rect x="96" y="112" width="120" height="16" rx="8" fill={BLUE} fillOpacity="0.22" />
      <rect x="96" y="144" width="200" height="10" rx="5" fill={BLUE} fillOpacity="0.14" />
      <rect x="96" y="168" width="176" height="10" rx="5" fill={BLUE} fillOpacity="0.1" />
      <rect x="96" y="208" width="88" height="36" rx="12" fill={BLUE} fillOpacity="0.85" />
      <circle cx="360" cy="200" r="40" fill={BLUE_LIGHT} fillOpacity="0.25" />
    </>
  );
}

export function HomeReadingCover({ collectionId = null, className = "" }: HomeReadingCoverProps) {
  return (
    <div className={["home-ws-reading-cover", className].join(" ")} aria-hidden>
      <svg viewBox="0 0 480 360" className="home-ws-reading-cover__svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="reading-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="50%" stopColor="#EFF6FF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
        </defs>
        <ReadingIllustration collectionId={collectionId} />
      </svg>
    </div>
  );
}
