import Link from "next/link";
import type { ReactNode } from "react";

import type { ExplorerMicroscopeData } from "@/lib/explorer/explorer-ia";

type ExplorerMicroscopePanelProps = {
  microscope: ExplorerMicroscopeData;
};

function MicroscopeSection({
  title,
  children,
  variant = "default",
}: {
  title: string;
  children: ReactNode;
  variant?: "default" | "overview" | "texts";
}) {
  return (
    <section
      className={[
        "explorer-microscope__section",
        variant === "overview" ? "explorer-microscope__section--overview" : "",
        variant === "texts" ? "explorer-microscope__section--texts" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h3 className="explorer-microscope__section-title">{title}</h3>
      {children}
    </section>
  );
}

export function ExplorerMicroscopePanel({ microscope }: ExplorerMicroscopePanelProps) {
  const hasLinks =
    (microscope.relatedConcepts?.length ?? 0) > 0 ||
    (microscope.relatedCases?.length ?? 0) > 0 ||
    (microscope.relatedWords?.length ?? 0) > 0 ||
    (microscope.similarItems?.length ?? 0) > 0;

  return (
    <div className="explorer-microscope">
      <p className="explorer-microscope__title">Microscope</p>

      {microscope.facts.length > 0 ? (
        <MicroscopeSection title="Overview" variant="overview">
          <dl className="explorer-microscope__facts">
            {microscope.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </MicroscopeSection>
      ) : null}

      {microscope.relatedConcepts && microscope.relatedConcepts.length > 0 ? (
        <MicroscopeSection title="Related concepts">
          <ul className="explorer-microscope__list">
            {microscope.relatedConcepts.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="explorer-microscope__link focus-kb">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </MicroscopeSection>
      ) : null}

      {microscope.relatedCases && microscope.relatedCases.length > 0 ? (
        <MicroscopeSection title="Related cases">
          <ul className="explorer-microscope__list">
            {microscope.relatedCases.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="explorer-microscope__link focus-kb">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </MicroscopeSection>
      ) : null}

      {microscope.relatedWords && microscope.relatedWords.length > 0 ? (
        <MicroscopeSection title="Related words">
          <ul className="explorer-microscope__list">
            {microscope.relatedWords.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="explorer-microscope__link focus-kb">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </MicroscopeSection>
      ) : null}

      {microscope.similarItems && microscope.similarItems.length > 0 ? (
        <MicroscopeSection title="Similar expressions">
          <ul className="explorer-microscope__list">
            {microscope.similarItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="explorer-microscope__link focus-kb">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </MicroscopeSection>
      ) : null}

      {microscope.linkedTexts.length > 0 ? (
        <MicroscopeSection title="Related texts" variant="texts">
          <ul className="explorer-microscope__list">
            {microscope.linkedTexts.map((text) => (
              <li key={text.textId}>
                <Link href={`/texts/${text.textId}`} className="explorer-microscope__link focus-kb">
                  {text.textTitle}
                </Link>
              </li>
            ))}
          </ul>
        </MicroscopeSection>
      ) : null}

      {!hasLinks && microscope.linkedTexts.length === 0 && microscope.facts.length === 0 ? (
        <p className="explorer-microscope__empty-text">
          Open an item to see its type, frequency, and where you have seen it.
        </p>
      ) : null}
    </div>
  );
}
