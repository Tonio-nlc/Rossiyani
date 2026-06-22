import Link from "next/link";

import type {
  ContextTranslationAnalysis,
  ContextTranslationGrammarConcept,
  ContextTranslationVocabularyItem,
} from "@/lib/context-translation/types";

type PracticeMicroscopePanelProps = {
  analysis?: ContextTranslationAnalysis | null;
  loading?: boolean;
};

function MicroscopeFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="practice-microscope__fact">
      <dt className="practice-microscope__fact-label">{label}</dt>
      <dd className="practice-microscope__fact-value break-russian">{value}</dd>
    </div>
  );
}

function pickKeyLemma(vocabulary: ContextTranslationVocabularyItem[]): string | null {
  const item = vocabulary.find((entry) => entry.word.trim().length > 0);
  if (!item) {
    return null;
  }
  return `${item.word} — ${item.meaning}`;
}

function pickPattern(concepts: ContextTranslationGrammarConcept[]): string | null {
  const concept = concepts.find((entry) => entry.label.trim().length > 0);
  if (!concept) {
    return null;
  }
  return concept.countLabel ? `${concept.label} · ${concept.countLabel}` : concept.label;
}

export function PracticeMicroscopePanel({
  analysis = null,
  loading = false,
}: PracticeMicroscopePanelProps) {
  const keyLemma = analysis ? pickKeyLemma(analysis.vocabulary) : null;
  const pattern = analysis ? pickPattern(analysis.grammarConcepts) : null;
  const expressionNote = analysis?.thinkLikeNative.conceptualShift?.trim() || null;
  const hasFacts = Boolean(keyLemma || pattern || expressionNote);

  return (
    <aside className="practice-microscope" aria-label="Microscope linguistique">
      <p className="practice-microscope__title">
        <span className="practice-microscope__icon" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.25" />
            <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
        </span>
        Microscope
      </p>

      {loading ? (
        <p className="practice-microscope__empty">Analyse en cours…</p>
      ) : !hasFacts ? (
        <p className="practice-microscope__empty">
          Les éléments clés du texte apparaîtront ici pour vous aider à traduire.
        </p>
      ) : (
        <dl className="practice-microscope__dashboard">
          {keyLemma ? <MicroscopeFact label="Mot clé" value={keyLemma} /> : null}
          {pattern ? (
            <div className="practice-microscope__fact">
              <dt className="practice-microscope__fact-label">Schéma grammatical</dt>
              <dd className="practice-microscope__fact-value">
                {analysis?.grammarConcepts[0]?.href ? (
                  <Link
                    href={analysis.grammarConcepts[0].href}
                    className="practice-microscope__link focus-kb break-russian"
                  >
                    {pattern}
                  </Link>
                ) : (
                  <span className="break-russian">{pattern}</span>
                )}
              </dd>
            </div>
          ) : null}
          {expressionNote ? (
            <MicroscopeFact label="Note d'expression" value={expressionNote} />
          ) : null}
        </dl>
      )}
    </aside>
  );
}
