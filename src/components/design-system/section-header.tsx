type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: string;
};

export function SectionHeader({ eyebrow, title, description, meta }: SectionHeaderProps) {
  return (
    <header className="ds-section-header space-y-3">
      {eyebrow ? <p className="text-eyebrow">{eyebrow}</p> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="editorial-title">{title}</h1>
        {meta ? <p className="text-metadata shrink-0">{meta}</p> : null}
      </div>
      {description ? <p className="editorial-intro">{description}</p> : null}
    </header>
  );
}
