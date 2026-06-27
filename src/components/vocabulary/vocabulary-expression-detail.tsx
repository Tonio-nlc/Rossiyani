"use client";

import { TextButton } from "@/components/design-system";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getSavedDiscoveries } from "@/lib/discovery/saved-discoveries";
import { vocabularyPath } from "@/lib/vocabulary";

import { VocabularyAudioButton } from "./vocabulary-audio-button";

export function VocabularyExpressionDetail() {
  const params = useParams<{ id: string }>();
  const [russian, setRussian] = useState<string | null>(null);

  useEffect(() => {
    const expression = getSavedDiscoveries().find((entry) => entry.id === params.id);
    setRussian(expression?.displayLabel ?? null);
  }, [params.id]);

  return (
    <article className="vocabulary-detail vocabulary-detail--expressions">
      <TextButton href={vocabularyPath("expressions")} className="vocabulary-detail__back">
        ← Vocabulary
      </TextButton>
      <div className="vocabulary-detail__head">
        <h1 className="r3-hero-title vocabulary-detail__title break-russian">
          {russian ?? "Expression"}
        </h1>
        {russian ? (
          <VocabularyAudioButton
            target={{
              scope: "utterance",
              text: russian,
              cacheKey: `vocab-expression:${params.id}`,
            }}
          />
        ) : null}
      </div>
      <p className="r3-lead vocabulary-detail__lead">
        Fiche d&apos;expression en préparation — variantes, mots composants, textes d&apos;origine et
        liens avec vos leçons arriveront ici.
      </p>
    </article>
  );
}
