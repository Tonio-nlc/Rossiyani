"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getSavedDiscoveries } from "@/lib/discovery/saved-discoveries";
import { vocabularyPath } from "@/lib/vocabulary";

export function VocabularyExpressionDetail() {
  const params = useParams<{ id: string }>();
  const [russian, setRussian] = useState<string | null>(null);

  useEffect(() => {
    const expression = getSavedDiscoveries().find((entry) => entry.id === params.id);
    setRussian(expression?.displayLabel ?? null);
  }, [params.id]);

  return (
    <article className="vocabulary-detail vocabulary-detail--expressions">
      <Link href={vocabularyPath("expressions")} className="vocabulary-detail__back focus-kb">
        ← Vocabulary
      </Link>
      <h1 className="vocabulary-detail__title break-russian">{russian ?? "Expression"}</h1>
      <p className="vocabulary-detail__lead">
        Fiche d&apos;expression en préparation — variantes, mots composants, textes d&apos;origine et
        liens avec vos leçons arriveront ici.
      </p>
    </article>
  );
}
