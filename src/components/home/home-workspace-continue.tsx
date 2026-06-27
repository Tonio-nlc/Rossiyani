"use client";

import { useEffect, useState } from "react";

import { Card, PrimaryButton } from "@/components/design-system";
import { getCefrLevelLabel } from "@/components/library/library-utils";
import type { HomeContinueBlock } from "@/lib/home/resolve-home-continue";
import { getTextReadingProgress } from "@/lib/reader/reading-progress";

type HomeWorkspaceContinueProps = {
  block: HomeContinueBlock;
};

export function HomeWorkspaceContinue({ block }: HomeWorkspaceContinueProps) {
  const [percent, setPercent] = useState(block.percent);

  useEffect(() => {
    const progress = getTextReadingProgress(block.textId);
    setPercent(progress?.percent ?? block.percent);
  }, [block]);

  const levelLabel =
    block.level !== "—"
      ? `${block.level} · ${getCefrLevelLabel(block.level as import("@/types").CefrLevel)}`
      : null;

  const metaLine = [block.collection, levelLabel, block.started ? `${percent} % lu` : null, `${block.estimatedMinutes} min`]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="home-ws-primary" aria-labelledby="home-continue-heading">
      <Card as="article" interactive className="home-ws-primary__card ws-card">
        <div className="ws-card__body">
          <p className="home-ws-primary__eyebrow ws-card__eyebrow">
            {block.started ? "En cours" : "Votre prochaine lecture"}
          </p>
          <h2 id="home-continue-heading" className="home-ws-primary__title ws-card__title break-russian">
            {block.title}
          </h2>
          <p className="home-ws-primary__meta ws-card__desc">{metaLine}</p>
          {block.started ? (
            <div className="home-ws-primary__progress" aria-hidden>
              <div
                className="home-ws-primary__progress-fill"
                style={{ width: `${Math.min(100, percent)}%` }}
              />
            </div>
          ) : null}
        </div>
        <footer className="ws-card__footer">
          <PrimaryButton href={block.href} className="home-ws-primary__cta">
            {block.ctaLabel} →
          </PrimaryButton>
        </footer>
      </Card>
    </section>
  );
}
