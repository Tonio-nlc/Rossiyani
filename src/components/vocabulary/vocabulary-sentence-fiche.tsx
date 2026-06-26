import { formatRelativeEncounter } from "@/lib/vocabulary";
import type { VocabularySentence } from "@/lib/vocabulary";

import { VocabularyAudioButton } from "./vocabulary-audio-button";
import { VocabularyBadges } from "./vocabulary-badges";
import { VocabularyFicheLink } from "./vocabulary-fiche-link";

type VocabularySentenceFicheProps = {
  sentence: VocabularySentence;
};

export function VocabularySentenceFiche({ sentence }: VocabularySentenceFicheProps) {
  return (
    <li>
      <VocabularyFicheLink href={sentence.detailHref} tone="sentences">
        <header className="vocabulary-fiche__head">
          <div className="vocabulary-fiche__title-block">
            <p className="vocabulary-fiche__russian break-russian">{sentence.russian}</p>
            {sentence.translation ? (
              <p className="vocabulary-fiche__translation">{sentence.translation}</p>
            ) : (
              <p className="vocabulary-fiche__translation vocabulary-fiche__translation--pending">
                Traduction non disponible
              </p>
            )}
          </div>
          <VocabularyAudioButton />
        </header>

        <dl className="vocabulary-fiche__facts vocabulary-fiche__facts--compact">
          <div className="vocabulary-fiche__fact">
            <dt>Texte d&apos;origine</dt>
            <dd>{sentence.sourceTextTitle}</dd>
          </div>
          {sentence.collection ? (
            <div className="vocabulary-fiche__fact">
              <dt>Collection</dt>
              <dd>{sentence.collection}</dd>
            </div>
          ) : null}
          <div className="vocabulary-fiche__fact">
            <dt>Enregistrée</dt>
            <dd>{formatRelativeEncounter(sentence.savedAt)}</dd>
          </div>
        </dl>

        <footer className="vocabulary-fiche__foot">
          <VocabularyBadges badges={sentence.badges} />
          <span className="vocabulary-fiche__secondary-link">Ouvrir la fiche →</span>
        </footer>
      </VocabularyFicheLink>
    </li>
  );
}
