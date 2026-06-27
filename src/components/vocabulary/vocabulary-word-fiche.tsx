import { formatRelativeEncounter } from "@/lib/vocabulary";
import type { VocabularyWord } from "@/lib/vocabulary";

import { VocabularyAudioButton } from "./vocabulary-audio-button";
import { VocabularyBadges } from "./vocabulary-badges";
import { VocabularyFicheLink } from "./vocabulary-fiche-link";

type VocabularyWordFicheProps = {
  word: VocabularyWord;
};

export function VocabularyWordFiche({ word }: VocabularyWordFicheProps) {
  const showHeadword =
    word.headword &&
    word.headword.trim().toLowerCase() !== word.russian.trim().toLowerCase();

  return (
    <li>
      <VocabularyFicheLink href={word.detailHref} tone="words">
        <header className="vocabulary-fiche__head">
          <div className="vocabulary-fiche__title-block">
            <p className="vocabulary-fiche__russian break-russian">
              {word.stressMarked ?? word.russian}
            </p>
            {word.translation ? (
              <p className="vocabulary-fiche__translation">{word.translation}</p>
            ) : (
              <p className="vocabulary-fiche__translation vocabulary-fiche__translation--pending">
                Traduction en cours d&apos;enrichissement
              </p>
            )}
          </div>
          <VocabularyAudioButton
            target={{
              scope: "utterance",
              text: word.stressMarked ?? word.russian,
              cacheKey: `vocab-word:${word.id}`,
            }}
          />
        </header>

        <dl className="vocabulary-fiche__facts">
          {showHeadword ? (
            <div className="vocabulary-fiche__fact">
              <dt>Mot</dt>
              <dd className="break-russian">{word.headword}</dd>
            </div>
          ) : null}
          {word.partOfSpeech ? (
            <div className="vocabulary-fiche__fact">
              <dt>Catégorie</dt>
              <dd>{word.partOfSpeech}</dd>
            </div>
          ) : null}
          {word.cefrLevel ? (
            <div className="vocabulary-fiche__fact">
              <dt>Niveau CECR</dt>
              <dd>{word.cefrLevel}</dd>
            </div>
          ) : null}
          {word.stressMarked ? (
            <div className="vocabulary-fiche__fact">
              <dt>Accent tonique</dt>
              <dd className="break-russian">{word.stressMarked}</dd>
            </div>
          ) : null}
          <div className="vocabulary-fiche__fact">
            <dt>Dernière rencontre</dt>
            <dd>{formatRelativeEncounter(word.lastSeenAt ?? word.savedAt)}</dd>
          </div>
          <div className="vocabulary-fiche__fact">
            <dt>Textes</dt>
            <dd>
              {word.textCount} texte{word.textCount > 1 ? "s" : ""}
            </dd>
          </div>
        </dl>

        {word.exampleRussian ? (
          <blockquote className="vocabulary-fiche__example">
            <p className="vocabulary-fiche__example-russian break-russian">{word.exampleRussian}</p>
            {word.exampleTranslation ? (
              <p className="vocabulary-fiche__example-translation">{word.exampleTranslation}</p>
            ) : null}
          </blockquote>
        ) : null}

        <footer className="vocabulary-fiche__foot">
          <VocabularyBadges badges={word.badges} />
          <span className="vocabulary-fiche__secondary-link">Voir dans le texte →</span>
        </footer>
      </VocabularyFicheLink>
    </li>
  );
}
