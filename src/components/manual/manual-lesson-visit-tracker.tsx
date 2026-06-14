"use client";

import { useEffect } from "react";

import { recordManualLessonVisit } from "@/lib/manual/manual-lesson-history";

type ManualLessonVisitTrackerProps = {
  slug: string;
};

export function ManualLessonVisitTracker({ slug }: ManualLessonVisitTrackerProps) {
  useEffect(() => {
    recordManualLessonVisit(slug);
  }, [slug]);

  return null;
}
