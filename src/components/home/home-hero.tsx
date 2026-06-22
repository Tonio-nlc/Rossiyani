import { GhostButton, PrimaryButton } from "@/components/design-system";

import { HomeHeroIllustration } from "./home-hero-illustration";

export function HomeHero() {
  return (
    <header className="home-hero">
      <div className="home-hero__content">
        <p className="home-hero__eyebrow">A Russian learning system built around authentic content</p>
        <h1 className="home-hero__title">
          Read Russian.
          <br />
          Understand Russian.
          <br />
          Think in Russian.
        </h1>
        <p className="home-hero__subtitle">
          Import authentic Russian content.
          <br />
          Discover vocabulary, grammar and patterns.
          <br />
          Practice what you actually encounter.
        </p>
        <div className="home-hero__actions">
          <PrimaryButton href="/reader" variant="gold">
            Start Reading
          </PrimaryButton>
          <GhostButton href="/library">Open Library</GhostButton>
        </div>
      </div>
      <HomeHeroIllustration />
      <div className="home-hero__rule" aria-hidden />
    </header>
  );
}
