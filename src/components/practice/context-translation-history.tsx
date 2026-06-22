import type { ContextTranslationHistoryEntry } from "@/lib/context-translation/translation-history";

type ContextTranslationHistoryProps = {
  entries: ContextTranslationHistoryEntry[];
};

export function ContextTranslationHistory({ entries }: ContextTranslationHistoryProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="practice-history" aria-label="Traductions récentes">
      <h2 className="practice-history__label">Traductions récentes</h2>
      <ul className="practice-history__list">
        {entries.map((entry) => (
          <li key={entry.id} className="practice-history__item">
            <span className="practice-history__check" aria-hidden>
              ✓
            </span>
            <p className="practice-history__line break-russian">
              <span className="practice-history__source">{entry.sourceText}</span>
              <span className="practice-history__arrow" aria-hidden>
                {" "}
                →{" "}
              </span>
              <span className="practice-history__translation">{entry.bestTranslation}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
