import Link from "next/link";

import { Badge } from "@/components/design-system";
import type { ManualLessonSummary } from "@/features/manual/types";
import { buildLessonsHubData } from "@/lib/lessons/build-lessons-hub";
import { LESSONS_HOME } from "@/lib/lessons/paths";

import { LessonsCollectionCard } from "./lessons-collection-card";
import { LessonsContinuePanel } from "./lessons-continue-panel";
import { LessonsDiscoverSection } from "./lessons-discover-section";
import { LessonsLessonGrid } from "./lessons-lesson-card";

export function LessonsHome() {
  const hub = buildLessonsHubData();

  return (
    <>
      <header className="lessons-hero">
        <p className="r3-eyebrow lessons-hero__eyebrow">Apprentissage structuré</p>
        <h1 className="r3-hero-title lessons-hero__title">Leçons</h1>
        <p className="r3-lead lessons-hero__lead">
          Choisissez un parcours, reprenez votre lecture, ou explorez une leçon — sans vous perdre
          dans le catalogue.
        </p>
        <div className="lessons-hero__metrics">
          <Badge tone="neutral">{hub.stats.totalLessons} leçons</Badge>
          {hub.stats.visitedCount > 0 ? (
            <Badge tone="blue">{hub.stats.visitedCount} déjà lues</Badge>
          ) : null}
        </div>
      </header>

      <LessonsContinuePanel />

      <section className="lessons-section" aria-labelledby="paths-heading">
        <div className="lessons-section__head">
          <div>
            <h2 id="paths-heading" className="r3-title lessons-section__title">
              Parcours
            </h2>
            <p className="r3-lead lessons-section__subtitle">
              Cinq entrées thématiques — chacune mène à un ensemble cohérent de leçons.
            </p>
          </div>
        </div>
        <div className="lessons-grid lessons-grid--collections">
          {hub.collections.map((collection) => (
            <LessonsCollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <LessonsDiscoverSection lessons={hub.discoverLessons} />

      <section className="lessons-section lessons-section--compact" aria-labelledby="levels-heading">
        <div className="lessons-section__head">
          <div>
            <h2 id="levels-heading" className="r3-title lessons-section__title">
              Par niveau CECR
            </h2>
            <p className="r3-lead lessons-section__subtitle">
              Progression du A1 au C2 — une seule entrée par niveau.
            </p>
          </div>
        </div>
        <nav className="lessons-level-nav" aria-label="Niveaux CECR">
          {hub.levelCollections.map((level) => (
            <Link key={level.id} href={level.href} className="lessons-level-pill focus-kb">
              <Badge tone="blue">{level.difficulty}</Badge>
            </Link>
          ))}
        </nav>
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
      <h1 className="r3-hero-title lessons-page-header__title">{title}</h1>
      {description ? <p className="r3-lead lessons-page-header__meta">{description}</p> : null}
      {meta ? <p className="r3-lead lessons-page-header__meta">{meta}</p> : null}
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
