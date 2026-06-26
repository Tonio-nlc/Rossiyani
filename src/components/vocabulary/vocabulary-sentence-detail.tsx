"use client";

import Link from "next/link";
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
      <Link href={vocabularyPath("sentences")} className="vocabulary-detail__back focus-kb">
        ← Vocabulary
      </Link>
      <h1 className="vocabulary-detail__title break-russian">{russian ?? "Phrase"}</h1>
      <p className="vocabulary-detail__lead">
        Fiche de phrase en préparation — mots connus, expressions détectées, notions grammaticales et
        révision espacée arriveront ici.
      </p>
    </article>
  );
}
