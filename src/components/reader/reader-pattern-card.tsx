import type { ReaderPatternExperienceView } from "@/types/reader-pattern-experience";

type ReaderPatternCardProps = {
  experience: ReaderPatternExperienceView;
};

export function ReaderPatternCard({ experience }: ReaderPatternCardProps) {
  if (!experience.visible) {
    return null;
  }

  return (
    <article className="reader-pattern-card" aria-label="Pourquoi le russe s'écrit ainsi">
      {experience.title ? (
        <h3 className="reader-pattern-card__title">{experience.title}</h3>
      ) : null}

      <div className="reader-pattern-card__sections">
        {experience.sections.map((section, index) => (
          <p key={`${section.depth}-${index}`} className="reader-pattern-card__section-body">
            {section.content}
          </p>
        ))}
      </div>

      {experience.phase === "insight" && experience.anchorText ? (
        <p className="reader-pattern-card__anchor">
          <span className="reader-pattern-card__anchor-label">Ici</span>
          {experience.anchorText}
        </p>
      ) : null}
    </article>
  );
}
