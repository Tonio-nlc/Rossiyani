"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getCefrLevelLabel } from "@/components/library/library-utils";
import type { ContinueReadingMeta } from "@/lib/home/resolve-continue-reading";
import { getTextReadingProgress } from "@/lib/reader/reading-progress";

import { HomeCollectionCover } from "./home-collection-cover";

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
    <article className="home-ws-card home-ws-continue">
      <div className="home-ws-continue__visual">
        {meta.collectionId ? (
          <HomeCollectionCover collectionId={meta.collectionId} />
        ) : null}
      </div>
      <div className="home-ws-continue__body">
        <p className="home-ws-eyebrow">Continue Learning</p>
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
            <dt>Reading Time</dt>
            <dd>{meta.estimatedMinutes} min</dd>
          </div>
        </dl>
        <div className="home-ws-continue__progress">
          <div className="home-ws-continue__progress-head">
            <span>Progress</span>
            <span className="home-ws-continue__progress-value">{percent}% complete</span>
          </div>
          <div
            className="home-ws-continue__progress-track"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Reading progress"
          >
            <div className="home-ws-continue__progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="home-ws-continue__actions">
          <Link href={meta.href} className="home-ws-btn home-ws-btn--large focus-kb">
            Continue Reading →
          </Link>
          <Link href="/library" className="home-ws-btn--text focus-kb">
            Library
          </Link>
        </div>
      </div>
    </article>
  );
}
