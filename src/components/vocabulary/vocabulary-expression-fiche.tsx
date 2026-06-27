import { formatRelativeEncounter } from "@/lib/vocabulary";
import type { VocabularyExpression } from "@/lib/vocabulary";

import { VocabularyAudioButton } from "./vocabulary-audio-button";
import { VocabularyBadges } from "./vocabulary-badges";
import { VocabularyFicheLink } from "./vocabulary-fiche-link";

type VocabularyExpressionFicheProps = {
  expression: VocabularyExpression;
};

export function VocabularyExpressionFiche({ expression }: VocabularyExpressionFicheProps) {
  return (
    <li>
      <VocabularyFicheLink href={expression.detailHref} tone="expressions">
        <header className="vocabulary-fiche__head">
          <div className="vocabulary-fiche__title-block">
            <p className="vocabulary-fiche__russian break-russian">{expression.russian}</p>
            {expression.translation ? (
              <p className="vocabulary-fiche__translation">{expression.translation}</p>
            ) : null}
          </div>
          <VocabularyAudioButton
            target={{
              scope: "utterance",
              text: expression.russian,
              cacheKey: `vocab-expression:${expression.id}`,
            }}
          />
        </header>

        {expression.meaning ? (
          <p className="vocabulary-fiche__meaning">{expression.meaning}</p>
        ) : null}

        {expression.exampleRussian ? (
          <blockquote className="vocabulary-fiche__example">
            <p className="vocabulary-fiche__example-russian break-russian">
              {expression.exampleRussian}
            </p>
            {expression.exampleTranslation ? (
              <p className="vocabulary-fiche__example-translation">{expression.exampleTranslation}</p>
            ) : null}
          </blockquote>
        ) : null}

        <footer className="vocabulary-fiche__foot">
          <VocabularyBadges badges={expression.badges} />
          <span className="vocabulary-fiche__meta-line">
            Ajoutée {formatRelativeEncounter(expression.savedAt)}
          </span>
        </footer>
      </VocabularyFicheLink>
    </li>
  );
}
