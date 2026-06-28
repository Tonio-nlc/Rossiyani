import type { ReaderPatternExperienceView } from "@/types/reader-pattern-experience";

type ReaderPatternCardProps = {
  experience: ReaderPatternExperienceView;
};

export function ReaderPatternCard({ experience }: ReaderPatternCardProps) {
  if (!experience.visible) {
    return null;
  }

  return (
    <article className="reader-pattern-card" aria-label="Idée russe">
      {experience.reminder ? (
        <p className="reader-pattern-card__reminder">{experience.reminder}</p>
      ) : null}

      {experience.title ? (
        <h3 className="reader-pattern-card__title">{experience.title}</h3>
      ) : null}

      <div className="reader-pattern-card__sections">
        {experience.sections.map((section) => (
          <section key={section.depth} className="reader-pattern-card__section">
            <p className="reader-pattern-card__section-label">{section.label}</p>
            <p className="reader-pattern-card__section-body">{section.content}</p>
          </section>
        ))}
      </div>

      {experience.phase === "insight" && experience.anchorText ? (
        <p className="reader-pattern-card__anchor">
          <span className="reader-pattern-card__anchor-label">Ici</span>
          {experience.anchorText}
        </p>
      ) : null}

      {experience.secondaryPatternCount > 0 ? (
        <p className="reader-pattern-card__footnote">
          {experience.secondaryPatternCount} autre
          {experience.secondaryPatternCount > 1 ? "s" : ""} régularité
          {experience.secondaryPatternCount > 1 ? "s" : ""} dans cette phrase — pour plus tard.
        </p>
      ) : null}
    </article>
  );
}
