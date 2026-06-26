"use client";

import { useEffect, useState } from "react";

import { Card, PrimaryButton } from "@/components/design-system";
import { getCefrLevelLabel } from "@/components/library/library-utils";
import type { ContinueReadingMeta } from "@/lib/home/resolve-continue-reading";
import { getTextReadingProgress } from "@/lib/reader/reading-progress";

type HomeWorkspaceContinueProps = {
  meta: ContinueReadingMeta;
};

export function HomeWorkspaceContinue({ meta }: HomeWorkspaceContinueProps) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const progress = meta.textId ? getTextReadingProgress(meta.textId) : null;
    setPercent(progress?.percent ?? 0);
  }, [meta]);

  const levelLabel =
    meta.level !== "—"
      ? `${meta.level} · ${getCefrLevelLabel(meta.level as import("@/types").CefrLevel)}`
      : null;

  const metaLine = [meta.collection, levelLabel, `${percent}% lu`, `${meta.estimatedMinutes} min`]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="lessons-section" aria-labelledby="home-continue-heading">
      <div className="lessons-section__head">
        <h2 id="home-continue-heading" className="r3-title lessons-section__title">
          Continuer votre lecture
        </h2>
      </div>

      <Card as="article" interactive className="lessons-continue ws-card">
        <div className="ws-card__body">
          <p className="lessons-continue__label ws-card__eyebrow">En cours</p>
          <p className="r3-title lessons-continue__title ws-card__title break-russian">{meta.title}</p>
          <p className="lessons-continue__meta ws-card__desc">{metaLine}</p>
        </div>
        <footer className="ws-card__footer">
          <PrimaryButton href={meta.href} className="lessons-continue__cta">
            Reprendre →
          </PrimaryButton>
        </footer>
      </Card>
    </section>
  );
}
