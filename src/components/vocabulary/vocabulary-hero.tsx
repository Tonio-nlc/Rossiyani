import type { VocabularyStats } from "@/lib/vocabulary";

type VocabularyHeroProps = {
  stats: VocabularyStats;
};

export function VocabularyHero({ stats }: VocabularyHeroProps) {
  return (
    <header className="vocabulary-hero">
      <h1 className="vocabulary-hero__title">Vocabulary</h1>
      <p className="vocabulary-hero__lead">Votre mémoire linguistique personnelle.</p>
      <div className="vocabulary-hero__metrics" aria-label="Statistiques">
        <span className="vocabulary-metric">
          {stats.words} mot{stats.words === 1 ? "" : "s"} appris
        </span>
        <span className="vocabulary-metric">
          {stats.expressions} expression{stats.expressions === 1 ? "" : "s"}
        </span>
        <span className="vocabulary-metric">
          {stats.sentences} phrase{stats.sentences === 1 ? "" : "s"} sauvegardée
          {stats.sentences === 1 ? "" : "s"}
        </span>
      </div>
    </header>
  );
}
