"use client";

import { useEffect } from "react";

import { recordManualLessonVisit } from "@/lib/manual/manual-lesson-history";

type LessonsLessonVisitTrackerProps = {
  slug: string;
  title?: string;
};

export function LessonsLessonVisitTracker({ slug, title }: LessonsLessonVisitTrackerProps) {
  useEffect(() => {
    recordManualLessonVisit(slug, title);
  }, [slug, title]);

  return null;
}
