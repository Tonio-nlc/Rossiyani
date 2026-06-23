"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PrimaryButton } from "@/components/design-system";
import { getCefrLevelLabel } from "@/components/library/library-utils";
import type { ContinueReadingMeta } from "@/lib/home/resolve-continue-reading";
import { getTextReadingProgress } from "@/lib/reader/reading-progress";

import { HomeReadingCover } from "./home-reading-cover";

type HomeWorkspaceContinueProps = {
  meta: ContinueReadingMeta;
};

export function HomeWorkspaceContinue({ meta }: HomeWorkspaceContinueProps) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!meta.textId) {
      setPercent(0);
      return;
    }
    const progress = getTextReadingProgress(meta.textId);
    setPercent(progress?.percent ?? 0);
  }, [meta.textId]);

  return (
    <article className="home-ws-card home-ws-card--hero home-ws-continue">
      <HomeReadingCover collectionId={meta.collectionId} className="home-ws-continue__cover" />
      <div className="home-ws-continue__body">
        <p className="home-ws-continue__eyebrow">Continue learning</p>
        <h2 className="home-ws-continue__title break-russian">{meta.title}</h2>
        <dl className="home-ws-continue__meta">
          <div>
            <dt>Collection</dt>
            <dd>{meta.collection}</dd>
          </div>
          <div>
            <dt>Level</dt>
            <dd>
              {meta.level !== "—"
                ? `${meta.level} · ${getCefrLevelLabel(meta.level as import("@/types").CefrLevel)}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Reading time</dt>
            <dd>{meta.estimatedMinutes} min</dd>
          </div>
        </dl>
        <div className="home-ws-continue__progress">
          <div className="home-ws-continue__progress-head">
            <span>Progress</span>
            <span className="home-ws-continue__progress-value">{percent}%</span>
          </div>
          <div className="home-ws-continue__progress-track" aria-hidden>
            <div className="home-ws-continue__progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <p className="home-ws-continue__detail">{meta.detail}</p>
        <div className="home-ws-continue__actions">
          <PrimaryButton href={meta.href} className="home-ws-continue__cta">
            Continue Reading →
          </PrimaryButton>
          <Link href="/library" className="home-ws-continue__secondary focus-kb">
            Library
          </Link>
        </div>
      </div>
    </article>
  );
}
