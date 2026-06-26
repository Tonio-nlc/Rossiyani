"use client";

import { TextButton } from "@/components/design-system";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getSavedReaderWords } from "@/lib/reader/saved-words";
import { vocabularyPath } from "@/lib/vocabulary";

export function VocabularyWordDetail() {
  const params = useParams<{ id: string }>();
  const [russian, setRussian] = useState<string | null>(null);

  useEffect(() => {
    const word = getSavedReaderWords().find((entry) => entry.id === params.id);
    setRussian(word?.displayForm ?? null);
  }, [params.id]);

  return (
    <article className="vocabulary-detail vocabulary-detail--words">
      <TextButton href={vocabularyPath("words")} className="vocabulary-detail__back">
        ← Vocabulary
      </TextButton>
      <h1 className="r3-hero-title vocabulary-detail__title break-russian">{russian ?? "Mot"}</h1>
      <p className="r3-lead vocabulary-detail__lead">
        Fiche complète en préparation — prononciation, déclinaisons, conjugaisons, exemples,
        révision espacée et connexions avec vos textes arriveront ici.
      </p>
    </article>
  );
}
