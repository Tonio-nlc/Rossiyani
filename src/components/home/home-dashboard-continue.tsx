"use client";

import Link from "next/link";

import { PrimaryButton } from "@/components/design-system";
import { LibraryCardProgress } from "@/components/library/library-card-progress";
import { getCollectionName } from "@/content/collections";
import type { TextListItem } from "@/features/texts";
import type { SessionJournal } from "@/lib/home/build-session-journal";

type HomeDashboardContinueProps = {
  narrative: SessionJournal;
  texts: TextListItem[];
};

function textIdFromHref(href?: string): string | null {
  if (!href?.startsWith("/texts/")) {
    return null;
  }
  return href.slice("/texts/".length).split("/")[0] ?? null;
}

function resolveContinueMeta(
  narrative: SessionJournal,
  texts: TextListItem[],
): {
  title: string;
  collection: string;
  level: string;
  href: string;
  textId: string | null;
  detail: string;
} | null {
  const entry = narrative.continueReading;
  if (!entry?.href) {
    const fallback = texts[0];
    if (!fallback) {
      return null;
    }
    return {
      title: fallback.title,
      collection: getCollectionName(fallback.collectionId),
      level: fallback.level,
      href: `/texts/${fallback.id}`,
      textId: fallback.id,
      detail: "Start your first reading session.",
    };
  }

  const textId = textIdFromHref(entry.href);
  const text = textId ? texts.find((item) => item.id === textId) : null;

  return {
    title: entry.label,
    collection: entry.collectionName ?? (text ? getCollectionName(text.collectionId) : "Library"),
    level: text?.level ?? "—",
    href: entry.href,
    textId,
    detail: entry.detail ?? "Pick up where you left off.",
  };
}

export function HomeDashboardContinue({ narrative, texts }: HomeDashboardContinueProps) {
  const meta = resolveContinueMeta(narrative, texts);
  if (!meta) {
    return null;
  }

  return (
    <section className="home-dash-section" aria-labelledby="home-dash-continue-heading">
      <div className="home-dash-section__head">
        <h2 id="home-dash-continue-heading" className="home-dash-section__title">
          Continue learning
        </h2>
        <p className="home-dash-section__lead">Your most recent reading session.</p>
      </div>

      <article className="home-dash-card home-dash-card--featured home-dash-continue">
        <div className="home-dash-continue__body">
          <p className="home-dash-continue__eyebrow">{meta.collection}</p>
          <h3 className="home-dash-continue__title break-russian">{meta.title}</h3>
          <dl className="home-dash-continue__meta">
            <div>
              <dt>Collection</dt>
              <dd>{meta.collection}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{meta.level}</dd>
            </div>
          </dl>
          <p className="home-dash-continue__detail">{meta.detail}</p>
          {meta.textId ? (
            <div className="home-dash-continue__progress">
              <LibraryCardProgress textId={meta.textId} compact />
            </div>
          ) : null}
        </div>
        <div className="home-dash-continue__cta">
          <PrimaryButton href={meta.href} className="home-dash-continue__button">
            Continue Reading →
          </PrimaryButton>
          <Link href="/library" className="home-dash-continue__secondary focus-kb">
            Browse library
          </Link>
        </div>
      </article>
    </section>
  );
}
