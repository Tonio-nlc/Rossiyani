"use client";

import { TextButton } from "@/components/design-system";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getSavedSentenceById } from "@/lib/phrase-mining";
import { vocabularyPath } from "@/lib/vocabulary";

export function VocabularySentenceDetail() {
  const params = useParams<{ id: string }>();
  const [russian, setRussian] = useState<string | null>(null);

  useEffect(() => {
    const sentence = getSavedSentenceById(params.id);
    setRussian(sentence?.text ?? null);
  }, [params.id]);

  return (
    <article className="vocabulary-detail vocabulary-detail--sentences">
      <TextButton href={vocabularyPath("sentences")} className="vocabulary-detail__back">
        ← Vocabulary
      </TextButton>
      <h1 className="r3-hero-title vocabulary-detail__title break-russian">{russian ?? "Phrase"}</h1>
      <p className="r3-lead vocabulary-detail__lead">
        Fiche de phrase en préparation — mots connus, expressions détectées, notions grammaticales et
        révision espacée arriveront ici.
      </p>
    </article>
  );
}
