type HomeReadingCoverProps = {
  collectionId?: string | null;
  className?: string;
};

export function HomeReadingCover({ collectionId = null, className = "" }: HomeReadingCoverProps) {
  const accent = collectionId === "stories" ? "#8b6b4a" : "#b08d57";
  const navy = "#1a2e44";

  return (
    <div className={["home-ws-reading-cover", className].join(" ")} aria-hidden>
      <svg viewBox="0 0 480 300" className="home-ws-reading-cover__svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="home-ws-reading-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
            <stop offset="55%" stopColor="#f5f3ee" stopOpacity="0.95" />
            <stop offset="100%" stopColor={navy} stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <rect width="480" height="300" fill="url(#home-ws-reading-grad)" />
        <circle cx="400" cy="56" r="72" fill={accent} fillOpacity="0.14" />
        <circle cx="64" cy="248" r="88" fill={navy} fillOpacity="0.08" />
        <rect x="88" y="72" width="220" height="156" rx="4" fill="white" fillOpacity="0.55" stroke={navy} strokeOpacity="0.12" strokeWidth="1.2" />
        <rect x="108" y="96" width="140" height="8" rx="2" fill={navy} fillOpacity="0.18" />
        <rect x="108" y="116" width="180" height="6" rx="2" fill={navy} fillOpacity="0.1" />
        <rect x="108" y="132" width="164" height="6" rx="2" fill={navy} fillOpacity="0.1" />
        <rect x="108" y="148" width="176" height="6" rx="2" fill={navy} fillOpacity="0.08" />
        <rect x="108" y="176" width="96" height="6" rx="2" fill={accent} fillOpacity="0.45" />
        <rect x="108" y="192" width="120" height="6" rx="2" fill={navy} fillOpacity="0.08" />
        <circle cx="292" cy="188" r="22" fill={accent} fillOpacity="0.22" stroke={accent} strokeOpacity="0.55" strokeWidth="1.2" />
        <path d="M284 188h16M292 180v16" stroke={navy} strokeOpacity="0.35" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M332 108 L356 92 L380 108 V148 H332 Z" fill="none" stroke={accent} strokeWidth="1.4" strokeOpacity="0.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
