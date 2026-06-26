import { Badge, GhostButton, PrimaryButton, SecondaryButton, TextButton } from "@/components/design-system";
import {
  MANUAL_CATEGORY_LABELS,
  MANUAL_LEVEL_LABELS,
  type ManualLesson,
} from "@/features/manual";
import { getNextLessonInPath, resolveLessonSummaries } from "@/lib/lessons/build-lessons-hub";
import { LESSONS_HOME, lessonPath, lessonsThemePath } from "@/lib/lessons/paths";
import { splitLessonContent } from "@/lib/lessons/split-lesson-content";

import { LessonsLessonGrid } from "./lessons-lesson-card";
import { LessonsLessonVisitTracker } from "./lessons-lesson-visit-tracker";
import { LessonsMarkdown } from "./lessons-markdown";

type LessonsLessonViewProps = {
  lesson: ManualLesson;
};

export function LessonsLessonView({ lesson }: LessonsLessonViewProps) {
  const { intro, blocks } = splitLessonContent(lesson.content);
  const related = resolveLessonSummaries(lesson.relatedLessons);
  const prerequisites = resolveLessonSummaries(lesson.prerequisites);
  const nextLesson = getNextLessonInPath(lesson);
  const practiceHref = `/practice?context=${encodeURIComponent(lesson.title)}`;

  return (
    <article className="lessons-lesson">
      <LessonsLessonVisitTracker slug={lesson.slug} title={lesson.title} />

      <header className="lessons-lesson-hero">
        <p className="r3-eyebrow lessons-lesson-hero__type">
          Leçon · {MANUAL_CATEGORY_LABELS[lesson.category]}
        </p>
        <h1 className="r3-hero-title lessons-lesson-hero__title">{lesson.title}</h1>
        <div className="lessons-lesson-hero__meta">
          <Badge tone="blue">{MANUAL_LEVEL_LABELS[lesson.level]}</Badge>
          <Badge tone="violet">{lesson.estimatedReadingTime} min</Badge>
          <Badge tone="neutral">Difficulté {lesson.difficulty}/5</Badge>
        </div>
        <div className="lessons-lesson-hero__actions">
          <SecondaryButton href={practiceHref}>Pratiquer cette leçon →</SecondaryButton>
          <GhostButton href={lessonsThemePath(lesson.category)}>
            Collection {MANUAL_CATEGORY_LABELS[lesson.category]}
          </GhostButton>
        </div>
      </header>

      {prerequisites.length > 0 ? (
        <aside className="lessons-prereq">
          <p className="lessons-prereq__label">Prérequis recommandés</p>
          <ul className="lessons-prereq__list">
            {prerequisites.map((item) => (
              <li key={item.slug}>
                <TextButton href={lessonPath(item.slug)} className="lessons-prereq__link">
                  {item.title}
                </TextButton>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      <div className="lessons-stack">
        {intro ? (
          <section className="lessons-block lessons-block--overview" aria-label="Aperçu">
            <h2 className="r3-title lessons-block__title">Aperçu</h2>
            <LessonsMarkdown content={intro} />
          </section>
        ) : null}

        {blocks.map((block) => (
          <section key={block.id} className="lessons-block" aria-labelledby={`block-${block.id}`}>
            <h2 id={`block-${block.id}`} className="r3-title lessons-block__title">
              {block.title}
            </h2>
            <LessonsMarkdown content={block.content} />
          </section>
        ))}
      </div>

      {related.length > 0 ? (
        <section className="lessons-section" aria-labelledby="related-heading">
          <div className="lessons-section__head">
            <h2 id="related-heading" className="r3-title lessons-section__title">
              Leçons liées
            </h2>
          </div>
          <LessonsLessonGrid lessons={related} />
        </section>
      ) : null}

      <footer className="lessons-progression">
        <h2 className="r3-title lessons-progression__title">Et maintenant ?</h2>
        <ul className="lessons-progression__list">
          <li>
            Vous avez parcouru {MANUAL_CATEGORY_LABELS[lesson.category].toLowerCase()} — niveau{" "}
            {lesson.level.toUpperCase()}.
          </li>
          {lesson.keywords.length > 0 ? (
            <li>Mots-clés : {lesson.keywords.slice(0, 5).join(" · ")}</li>
          ) : null}
        </ul>
        <div className="lessons-progression__actions">
          <SecondaryButton href={practiceHref}>Pratiquer →</SecondaryButton>
          {nextLesson ? (
            <PrimaryButton href={lessonPath(nextLesson.slug)}>Leçon suivante →</PrimaryButton>
          ) : null}
          <GhostButton href={lessonsThemePath(lesson.category)}>Retour à la collection</GhostButton>
          <GhostButton href={LESSONS_HOME}>Toutes les leçons</GhostButton>
        </div>
      </footer>
    </article>
  );
}
