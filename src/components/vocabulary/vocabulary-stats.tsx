import type { VocabularyStats } from "@/lib/vocabulary";

type VocabularyStatsProps = {
  stats: VocabularyStats;
};

export function VocabularyStatsRow({ stats }: VocabularyStatsProps) {
  return (
    <div className="vocabulary-stats" aria-label="Statistiques rapides">
      <div className="vocabulary-stat vocabulary-stat--words">
        <span className="vocabulary-stat__value">{stats.words}</span>
        <span className="vocabulary-stat__label">mots appris</span>
      </div>
      <div className="vocabulary-stat vocabulary-stat--expressions">
        <span className="vocabulary-stat__value">{stats.expressions}</span>
        <span className="vocabulary-stat__label">expressions</span>
      </div>
      <div className="vocabulary-stat vocabulary-stat--sentences">
        <span className="vocabulary-stat__value">{stats.sentences}</span>
        <span className="vocabulary-stat__label">phrases sauvegardées</span>
      </div>
    </div>
  );
}
