import Link from "next/link";
import type { ReactNode } from "react";

import type { ExplorerMicroscopeData } from "@/lib/explorer/explorer-ia";
import { appearsAcrossTexts } from "@/lib/explorer/explorer-ia";

type ExplorerMicroscopePanelProps = {
  microscope: ExplorerMicroscopeData;
};

function MicroscopeBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="explorer-microscope__block">
      <p className="explorer-microscope__block-label">{label}</p>
      <div className="explorer-microscope__block-body">{children}</div>
    </div>
  );
}

export function ExplorerMicroscopePanel({ microscope }: ExplorerMicroscopePanelProps) {
  const textCount = microscope.linkedTexts.length;
  const seenInLabel =
    textCount > 0 ? appearsAcrossTexts(textCount) : "Not yet seen in your texts";

  return (
    <div className="explorer-microscope">
      <p className="explorer-microscope__title">Microscope</p>

      {microscope.facts.length > 0 ? (
        <div className="explorer-microscope__overview">
          {microscope.facts.map((fact) => (
            <MicroscopeBlock key={fact.label} label={fact.label}>
              <p className="explorer-microscope__value">{fact.value}</p>
            </MicroscopeBlock>
          ))}
        </div>
      ) : null}

      {textCount > 0 ? (
        <MicroscopeBlock label="Seen in">
          <p className="explorer-microscope__value">{seenInLabel}</p>
        </MicroscopeBlock>
      ) : null}

      {microscope.relatedCases && microscope.relatedCases.length > 0 ? (
        <MicroscopeBlock label="Related cases">
          <ul className="explorer-microscope__chip-list">
            {microscope.relatedCases.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="explorer-microscope__chip focus-kb">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </MicroscopeBlock>
      ) : null}

      {microscope.relatedConcepts && microscope.relatedConcepts.length > 0 ? (
        <MicroscopeBlock label="Related concepts">
          <ul className="explorer-microscope__chip-list">
            {microscope.relatedConcepts.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="explorer-microscope__chip focus-kb">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </MicroscopeBlock>
      ) : null}

      {microscope.relatedWords && microscope.relatedWords.length > 0 ? (
        <MicroscopeBlock label="Related words">
          <ul className="explorer-microscope__chip-list">
            {microscope.relatedWords.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="explorer-microscope__chip focus-kb">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </MicroscopeBlock>
      ) : null}

      {microscope.similarItems && microscope.similarItems.length > 0 ? (
        <MicroscopeBlock label="Similar expressions">
          <ul className="explorer-microscope__chip-list">
            {microscope.similarItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="explorer-microscope__chip focus-kb">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </MicroscopeBlock>
      ) : null}

      {microscope.linkedTexts.length > 0 ? (
        <MicroscopeBlock label="Related texts">
          <ul className="explorer-microscope__text-list">
            {microscope.linkedTexts.map((text) => (
              <li key={text.textId}>
                <Link href={`/texts/${text.textId}`} className="explorer-microscope__text-link focus-kb">
                  {text.textTitle}
                </Link>
              </li>
            ))}
          </ul>
        </MicroscopeBlock>
      ) : null}
    </div>
  );
}
