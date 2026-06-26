"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, PrimaryButton, TextButton } from "@/components/design-system";
import { getCefrLevelLabel } from "@/components/library/library-utils";
import {
  buildHeroContinueInsights,
  type HeroContinueInsights,
} from "@/lib/home/build-hero-continue-insights";
import type { ContinueReadingMeta } from "@/lib/home/resolve-continue-reading";
import { getTextReadingProgress } from "@/lib/reader/reading-progress";

import { HomeReadingCover } from "./home-reading-cover";

type HomeWorkspaceContinueProps = {
  meta: ContinueReadingMeta;
  wordsDiscovered: number;
};

export function HomeWorkspaceContinue({ meta, wordsDiscovered }: HomeWorkspaceContinueProps) {
  const [percent, setPercent] = useState(0);
  const [insights, setInsights] = useState<HeroContinueInsights>(() =>
    buildHeroContinueInsights(meta, null, wordsDiscovered),
  );

  useEffect(() => {
    const progress = meta.textId ? getTextReadingProgress(meta.textId) : null;
    setPercent(progress?.percent ?? 0);
    setInsights(buildHeroContinueInsights(meta, progress, wordsDiscovered));
  }, [meta, wordsDiscovered]);

  const insightRows = useMemo(
    () => [
      { label: "Last session", value: insights.lastSession },
      { label: "Estimated remaining", value: `${insights.estimatedRemainingMinutes} min` },
      { label: "Next milestone", value: insights.nextMilestone },
      { label: "Current vocabulary", value: `${insights.wordsDiscovered} words discovered` },
    ],
    [insights],
  );

  return (
    <Card as="article" hero className="home-ws-continue">
      <div className="home-ws-continue__visual">
        <HomeReadingCover collectionId={meta.collectionId} />
      </div>
      <div className="home-ws-continue__body">
        <p className="r3-eyebrow home-ws-eyebrow">Pick up where you left off</p>
        <h2 className="r3-hero-title home-ws-continue__title break-russian">{meta.title}</h2>
        <dl className="home-ws-continue__meta">
          <div>
            <dt>Path</dt>
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
            <dt>Session</dt>
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
        <dl className="home-ws-continue__insights">
          {insightRows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="home-ws-continue__actions">
          <PrimaryButton href={meta.href} large>
            Continue lesson →
          </PrimaryButton>
          <TextButton href="/practice">Today&apos;s practice</TextButton>
        </div>
      </div>
    </Card>
  );
}
