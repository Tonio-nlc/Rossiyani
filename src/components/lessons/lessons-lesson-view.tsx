import Link from "next/link";

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
        <p className="lessons-lesson-hero__type">Leçon · {MANUAL_CATEGORY_LABELS[lesson.category]}</p>
        <h1 className="lessons-lesson-hero__title">{lesson.title}</h1>
        <div className="lessons-lesson-hero__meta">
          <span className="lessons-tag">{MANUAL_LEVEL_LABELS[lesson.level]}</span>
          <span className="lessons-tag lessons-tag--accent">{lesson.estimatedReadingTime} min</span>
          <span className="lessons-tag">Difficulté {lesson.difficulty}/5</span>
        </div>
        <div className="lessons-lesson-hero__actions">
          <Link href={practiceHref} className="lessons-btn lessons-btn--practice focus-kb">
            Pratiquer cette leçon →
          </Link>
          <Link href={lessonsThemePath(lesson.category)} className="lessons-btn lessons-btn--ghost focus-kb">
            Collection {MANUAL_CATEGORY_LABELS[lesson.category]}
          </Link>
        </div>
      </header>

      {prerequisites.length > 0 ? (
        <aside className="lessons-prereq">
          <p className="lessons-prereq__label">Prérequis recommandés</p>
          <ul className="lessons-prereq__list">
            {prerequisites.map((item) => (
              <li key={item.slug}>
                <Link href={lessonPath(item.slug)} className="lessons-prereq__link focus-kb">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      <div className="lessons-stack">
        {intro ? (
          <section className="lessons-block lessons-block--overview" aria-label="Aperçu">
            <h2 className="lessons-block__title">Aperçu</h2>
            <LessonsMarkdown content={intro} />
          </section>
        ) : null}

        {blocks.map((block) => (
          <section key={block.id} className="lessons-block" aria-labelledby={`block-${block.id}`}>
            <h2 id={`block-${block.id}`} className="lessons-block__title">
              {block.title}
            </h2>
            <LessonsMarkdown content={block.content} />
          </section>
        ))}
      </div>

      {related.length > 0 ? (
        <section className="lessons-section" aria-labelledby="related-heading">
          <div className="lessons-section__head">
            <h2 id="related-heading" className="lessons-section__title">
              Leçons liées
            </h2>
          </div>
          <LessonsLessonGrid lessons={related} />
        </section>
      ) : null}

      <footer className="lessons-progression">
        <h2 className="lessons-progression__title">Et maintenant ?</h2>
        <ul className="lessons-progression__list">
          <li>Vous avez parcouru {MANUAL_CATEGORY_LABELS[lesson.category].toLowerCase()} — niveau {lesson.level.toUpperCase()}.</li>
          {lesson.keywords.length > 0 ? (
            <li>Mots-clés : {lesson.keywords.slice(0, 5).join(" · ")}</li>
          ) : null}
        </ul>
        <div className="lessons-progression__actions">
          <Link href={practiceHref} className="lessons-btn lessons-btn--practice focus-kb">
            Pratiquer →
          </Link>
          {nextLesson ? (
            <Link href={lessonPath(nextLesson.slug)} className="lessons-btn lessons-btn--primary focus-kb">
              Leçon suivante →
            </Link>
          ) : null}
          <Link href={lessonsThemePath(lesson.category)} className="lessons-btn lessons-btn--ghost focus-kb">
            Retour à la collection
          </Link>
          <Link href={LESSONS_HOME} className="lessons-btn lessons-btn--ghost focus-kb">
            Toutes les leçons
          </Link>
        </div>
      </footer>
    </article>
  );
}
