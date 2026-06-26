"use client";

import { useEffect, useState } from "react";

import { Card, PrimaryButton } from "@/components/design-system";
import { getRecentManualLessonVisits } from "@/lib/manual/manual-lesson-history";
import { lessonPath } from "@/lib/lessons/paths";

export function LessonsContinuePanel() {
  const [visit, setVisit] = useState<{ href: string; title: string } | null>(null);

  useEffect(() => {
    const recent = getRecentManualLessonVisits(1)[0];
    if (!recent) {
      return;
    }
    setVisit({
      href: lessonPath(recent.slug),
      title: recent.title ?? recent.slug,
    });
  }, []);

  if (!visit) {
    return null;
  }

  return (
    <section className="lessons-section" aria-labelledby="continue-heading">
      <div className="lessons-section__head">
        <h2 id="continue-heading" className="r3-title lessons-section__title">
          Reprendre
        </h2>
      </div>
      <Card as="article" interactive className="lessons-continue">
        <div>
          <p className="lessons-continue__label">Continuer l&apos;apprentissage</p>
          <p className="r3-title lessons-continue__title">{visit.title}</p>
        </div>
        <PrimaryButton href={visit.href} className="lessons-continue__cta">
          Reprendre →
        </PrimaryButton>
      </Card>
    </section>
  );
}
