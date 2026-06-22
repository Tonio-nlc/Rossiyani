import type { ReactNode } from "react";

import { GhostButton } from "@/components/design-system";

type PracticeExerciseHeaderProps = {
  backHref?: string;
  backLabel?: string;
  exerciseType: string;
  title?: string | null;
  subtitle?: string | null;
  meta?: ReactNode;
  sourceLabel?: string | null;
  sourceTitle?: string | null;
  sourceHref?: string | null;
};

export function PracticeExerciseHeader({
  backHref = "/practice",
  backLabel = "← Pratique",
  exerciseType,
  title,
  subtitle,
  meta,
  sourceLabel,
  sourceTitle,
  sourceHref,
}: PracticeExerciseHeaderProps) {
  return (
    <header className="practice-exercise-header">
      <GhostButton href={backHref}>{backLabel}</GhostButton>

      <div className="practice-exercise-header__body">
        <p className="practice-exercise-header__type">{exerciseType}</p>
        {title ? <h1 className="practice-exercise-header__title">{title}</h1> : null}
        {subtitle ? <p className="practice-exercise-header__subtitle">{subtitle}</p> : null}
        {meta ? <div className="practice-exercise-header__meta">{meta}</div> : null}
      </div>

      {sourceTitle ? (
        <div className="practice-exercise-header__source">
          <p className="practice-exercise-header__source-label">
            {sourceLabel ?? "Issu de votre lecture"}
          </p>
          {sourceHref ? (
            <a href={sourceHref} className="practice-exercise-header__source-link focus-kb">
              {sourceTitle}
            </a>
          ) : (
            <p className="practice-exercise-header__source-title">{sourceTitle}</p>
          )}
        </div>
      ) : null}
    </header>
  );
}
