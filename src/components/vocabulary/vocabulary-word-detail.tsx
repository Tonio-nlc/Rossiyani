"use client";

import { TextButton } from "@/components/design-system";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { fetchVocabularyWordFiche } from "@/lib/vocabulary/fetch-vocabulary-word-fiche";
import { getSavedReaderWords } from "@/lib/reader/saved-words";
import type { SavedReaderWord } from "@/lib/reader/saved-words";
import { vocabularyPath } from "@/lib/vocabulary";
import type { VocabularyWordFiche } from "@/lib/vocabulary/vocabulary-word-fiche-types";

import { VocabularyWordFicheView } from "./word-fiche/vocabulary-word-fiche-view";

export function VocabularyWordDetail() {
  const params = useParams<{ id: string }>();
  const [savedWord, setSavedWord] = useState<SavedReaderWord | null>(null);
  const [fiche, setFiche] = useState<VocabularyWordFiche | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const word = getSavedReaderWords().find((entry) => entry.id === params.id) ?? null;
    setSavedWord(word);

    if (!word) {
      setLoading(false);
      setError("Mot introuvable dans votre vocabulaire.");
      return;
    }

    setLoading(true);
    setError(null);
    void fetchVocabularyWordFiche(word)
      .then((result) => {
        setFiche(result);
        if (!result) {
          setError("Aucune fiche linguistique n'est encore disponible pour ce mot.");
        }
      })
      .catch(() => {
        setError("Impossible de charger la fiche.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id]);

  return (
    <div className="vocab-fiche-page">
      <TextButton href={vocabularyPath()} className="vocab-fiche-page__back">
        ← Vocabulary
      </TextButton>

      {loading ? (
        <div className="vocab-fiche-page__loading" aria-live="polite">
          <p>Chargement de la fiche…</p>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="vocab-fiche-page__fallback">
          <h1 className="vocab-fiche-page__fallback-title break-russian">
            {savedWord?.displayForm ?? "Mot"}
          </h1>
          <p className="vocab-fiche-page__fallback-copy">{error}</p>
          {savedWord ? (
            <Link href={`/texts/${savedWord.textId}`} className="vocab-fiche__action focus-kb">
              Retourner au texte d&apos;origine →
            </Link>
          ) : null}
        </div>
      ) : null}

      {!loading && fiche ? <VocabularyWordFicheView fiche={fiche} /> : null}
    </div>
  );
}
