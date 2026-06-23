import type { CollectionId } from "@/content/collections";

type HomeReadingCoverProps = {
  collectionId?: CollectionId | null;
  className?: string;
};

const NAVY = "#1a2e44";
const GOLD = "#b08d57";
const CREAM = "#fbf9f4";

function ReadingIllustration({ collectionId }: { collectionId: CollectionId | null }) {
  if (collectionId === "stories") {
    return (
      <>
        <rect width="480" height="360" fill="url(#reading-grad)" />
        <rect x="96" y="64" width="200" height="140" rx="3" fill={CREAM} stroke={NAVY} strokeOpacity="0.12" />
        <path d="M296 64v140l-18-12-18 12V64z" fill={GOLD} fillOpacity="0.28" />
        <path d="M116 88h160M116 108h120M116 128h140M116 148h96" stroke={NAVY} strokeOpacity="0.12" strokeWidth="2" strokeLinecap="round" />
        <circle cx="360" cy="88" r="28" fill={GOLD} fillOpacity="0.2" />
      </>
    );
  }

  if (collectionId === "dialogues") {
    return (
      <>
        <rect width="480" height="360" fill="url(#reading-grad)" />
        <circle cx="180" cy="168" r="52" fill={CREAM} stroke={NAVY} strokeOpacity="0.1" />
        <circle cx="300" cy="184" r="58" fill="#efe8dc" stroke={NAVY} strokeOpacity="0.1" />
        <path d="M88 120h80l-12 18H100z" fill="white" fillOpacity="0.8" stroke={GOLD} strokeOpacity="0.4" />
        <rect x="128" y="96" width="224" height="160" rx="4" fill="white" fillOpacity="0.45" stroke={NAVY} strokeOpacity="0.1" />
        <path d="M152 128h176M152 152h140M152 176h160" stroke={NAVY} strokeOpacity="0.1" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  }

  return (
    <>
      <rect width="480" height="360" fill="url(#reading-grad)" />
      <rect x="56" y="48" width="168" height="112" rx="3" fill={CREAM} stroke={NAVY} strokeOpacity="0.12" />
      <rect x="72" y="64" width="56" height="68" rx="1" fill="#e8dfd0" fillOpacity="0.7" />
      <ellipse cx="120" cy="148" rx="44" ry="12" fill={GOLD} fillOpacity="0.28" />
      <rect x="248" y="88" width="176" height="148" rx="4" fill="white" fillOpacity="0.62" stroke={NAVY} strokeOpacity="0.1" />
      <rect x="268" y="112" width="120" height="10" rx="2" fill={NAVY} fillOpacity="0.16" />
      <rect x="268" y="132" width="136" height="8" rx="2" fill={NAVY} fillOpacity="0.1" />
      <rect x="268" y="148" width="128" height="8" rx="2" fill={NAVY} fillOpacity="0.08" />
      <rect x="268" y="176" width="88" height="8" rx="2" fill={GOLD} fillOpacity="0.45" />
      <circle cx="372" cy="208" r="28" fill={GOLD} fillOpacity="0.22" stroke={GOLD} strokeOpacity="0.5" />
    </>
  );
}

export function HomeReadingCover({ collectionId = null, className = "" }: HomeReadingCoverProps) {
  return (
    <div className={["home-ws-reading-cover", className].join(" ")} aria-hidden>
      <svg viewBox="0 0 480 360" className="home-ws-reading-cover__svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="reading-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7f1e8" />
            <stop offset="45%" stopColor={CREAM} />
            <stop offset="100%" stopColor="#e6dcc8" />
          </linearGradient>
        </defs>
        <ReadingIllustration collectionId={collectionId} />
      </svg>
    </div>
  );
}
