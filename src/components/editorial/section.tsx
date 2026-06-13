import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  className?: string;
};

export function Section({ id, eyebrow, title, intro, children, className = "" }: SectionProps) {
  return (
    <section
      id={id}
      className={["editorial-section", className].filter(Boolean).join(" ")}
    >
      {eyebrow ? <p className="text-eyebrow mb-3">{eyebrow}</p> : null}
      {title ? <h2 className="editorial-section-title mb-3">{title}</h2> : null}
      {intro ? <p className="editorial-intro mb-6">{intro}</p> : null}
      {children}
    </section>
  );
}
