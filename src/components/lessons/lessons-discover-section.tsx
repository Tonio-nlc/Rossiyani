"use client";

import { useEffect, useState } from "react";

import type { ManualLessonSummary } from "@/features/manual/types";
import { getRecentManualLessonVisits } from "@/lib/manual/manual-lesson-history";

import { LessonsLessonGrid } from "./lessons-lesson-card";

type LessonsDiscoverSectionProps = {
  lessons: ManualLessonSummary[];
};

export function LessonsDiscoverSection({ lessons }: LessonsDiscoverSectionProps) {
  const [visible, setVisible] = useState(lessons);

  useEffect(() => {
    const continueSlug = getRecentManualLessonVisits(1)[0]?.slug;
    if (!continueSlug) {
      return;
    }
    setVisible(lessons.filter((lesson) => lesson.slug !== continueSlug));
  }, [lessons]);

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="lessons-section" aria-labelledby="discover-heading">
      <div className="lessons-section__head">
        <div>
          <h2 id="discover-heading" className="lessons-section__title">
            À découvrir
          </h2>
          <p className="lessons-section__subtitle">
            Quatre leçons variées pour commencer ou changer d&apos;angle — pas un échantillon du
            catalogue entier.
          </p>
        </div>
      </div>
      <LessonsLessonGrid lessons={visible} />
    </section>
  );
}
