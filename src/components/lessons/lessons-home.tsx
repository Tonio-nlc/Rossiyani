import Link from "next/link";

import type { ManualLessonSummary } from "@/features/manual/types";
import { buildLessonsHubData } from "@/lib/lessons/build-lessons-hub";
import { LESSONS_HOME } from "@/lib/lessons/paths";

import { LessonsCollectionCard } from "./lessons-collection-card";
import { LessonsContinuePanel } from "./lessons-continue-panel";
import { LessonsLessonGrid } from "./lessons-lesson-card";

export function LessonsHome() {
  const hub = buildLessonsHubData();

  return (
    <>
      <header className="lessons-hero">
        <p className="lessons-hero__eyebrow">Apprentissage structuré</p>
        <h1 className="lessons-hero__title">Leçons</h1>
        <p className="lessons-hero__lead">
          Grammaire, vocabulaire et culture — un parcours premium pour progresser en russe avec
          clarté et rythme.
        </p>
        <div className="lessons-hero__metrics">
          <span className="lessons-metric">{hub.stats.totalLessons} leçons</span>
          {hub.stats.visitedCount > 0 ? (
            <span className="lessons-metric">{hub.stats.visitedCount} explorées</span>
          ) : null}
        </div>
      </header>

      <LessonsContinuePanel />

      <section className="lessons-section" aria-labelledby="collections-heading">
        <div className="lessons-section__head">
          <div>
            <h2 id="collections-heading" className="lessons-section__title">
              Collections
            </h2>
            <p className="lessons-section__subtitle">
              Parcours thématiques pour explorer le russe par objectif.
            </p>
          </div>
        </div>
        <div className="lessons-grid lessons-grid--collections">
          {hub.featuredCollections.map((collection) => (
            <LessonsCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="lessons-section" aria-labelledby="foundations-heading">
        <div className="lessons-section__head">
          <h2 id="foundations-heading" className="lessons-section__title">
            Fondations
          </h2>
          <Link href="/lessons/niveau/a1" className="lessons-section__link focus-kb">
            Voir le niveau A1 →
          </Link>
        </div>
        <LessonsLessonGrid
          lessons={hub.foundations}
          emptyDescription="Les leçons de fondation arrivent bientôt."
        />
      </section>

      <section className="lessons-section" aria-labelledby="grammar-heading">
        <div className="lessons-section__head">
          <div>
            <h2 id="grammar-heading" className="lessons-section__title">
              Grammaire — les six cas
            </h2>
            <p className="lessons-section__subtitle">
              Chaque cas répond à une question précise dans la phrase russe.
            </p>
          </div>
        </div>
        <div className="lessons-grid lessons-grid--collections">
          {hub.grammarCollections.map((collection) => (
            <LessonsCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="lessons-section" aria-labelledby="recommended-heading">
        <div className="lessons-section__head">
          <h2 id="recommended-heading" className="lessons-section__title">
            Recommandées
          </h2>
        </div>
        <LessonsLessonGrid lessons={hub.recommended} />
      </section>

      <section className="lessons-section" aria-labelledby="popular-heading">
        <div className="lessons-section__head">
          <h2 id="popular-heading" className="lessons-section__title">
            Populaires
          </h2>
        </div>
        <LessonsLessonGrid lessons={hub.popular} />
      </section>

      <section className="lessons-section" aria-labelledby="levels-heading">
        <div className="lessons-section__head">
          <h2 id="levels-heading" className="lessons-section__title">
            Par niveau
          </h2>
        </div>
        <div className="lessons-grid lessons-grid--compact">
          {hub.levelCollections.map((collection) => (
            <LessonsCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>
    </>
  );
}

export function LessonsCollectionHeader({
  backHref = LESSONS_HOME,
  backLabel = "← Leçons",
  title,
  description,
  meta,
}: {
  backHref?: string;
  backLabel?: string;
  title: string;
  description?: string;
  meta?: string;
}) {
  return (
    <header className="lessons-page-header">
      <Link href={backHref} className="lessons-back focus-kb">
        {backLabel}
      </Link>
      <h1 className="lessons-page-header__title">{title}</h1>
      {description ? <p className="lessons-page-header__meta">{description}</p> : null}
      {meta ? <p className="lessons-page-header__meta">{meta}</p> : null}
    </header>
  );
}

export function LessonsBrowseSection({
  title,
  lessons,
  emptyMessage,
}: {
  title: string;
  lessons: ManualLessonSummary[];
  emptyMessage?: string;
}) {
  return (
    <section className="lessons-section" aria-label={title}>
      <LessonsLessonGrid lessons={lessons} emptyDescription={emptyMessage} />
    </section>
  );
}
