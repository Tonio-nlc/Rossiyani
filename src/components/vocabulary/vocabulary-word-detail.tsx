"use client";

import Link from "next/link";
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
      <Link href={vocabularyPath("words")} className="vocabulary-detail__back focus-kb">
        ← Vocabulary
      </Link>
      <h1 className="vocabulary-detail__title break-russian">{russian ?? "Mot"}</h1>
      <p className="vocabulary-detail__lead">
        Fiche complète en préparation — prononciation, déclinaisons, conjugaisons, exemples,
        révision espacée et connexions avec vos textes arriveront ici.
      </p>
    </article>
  );
}
