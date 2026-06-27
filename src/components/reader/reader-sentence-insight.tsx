"use client";

import { useState } from "react";

import type { ReaderSentenceInsight } from "@/lib/reader/build-reader-sentence-insight";

type ReaderSentenceInsightProps = {
  insight: ReaderSentenceInsight;
  expanded: boolean;
  onToggle: () => void;
};

function InsightSection({
  section,
}: {
  section: ReaderSentenceInsight["sections"][number];
}) {
  const [showFull, setShowFull] = useState(false);
  const body = showFull ? section.fullBody : section.body;

  return (
    <article className="reader-ws-sentence-insight__section">
      <h4 className="reader-ws-sentence-insight__section-title">{section.title}</h4>
      <p className="reader-ws-sentence-insight__section-body">{body}</p>
      {section.truncated ? (
        <button
          type="button"
          className="reader-ws-sentence-insight__more focus-kb"
          onClick={(event) => {
            event.stopPropagation();
            setShowFull((value) => !value);
          }}
        >
          {showFull ? "Réduire" : "Voir plus"}
        </button>
      ) : null}
    </article>
  );
}

export function ReaderSentenceInsightPanel({ insight, expanded, onToggle }: ReaderSentenceInsightProps) {
  if (!insight.available) {
    return null;
  }

  return (
    <div className="reader-ws-sentence-insight-wrap">
      <button
        type="button"
        className="reader-ws-sentence-insight-toggle focus-kb"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        aria-expanded={expanded}
      >
        {expanded ? (
          <>
            Masquer l&apos;analyse <span aria-hidden>↓</span>
          </>
        ) : (
          <>
            Comprendre la phrase <span aria-hidden>→</span>
          </>
        )}
      </button>

      <div
        className={[
          "grid transition-[grid-template-rows,opacity] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
        aria-hidden={!expanded}
      >
        <div className="overflow-hidden">
          <section className="reader-ws-sentence-insight" aria-label="Analyse de la phrase">
            {insight.sections.map((section) => (
              <InsightSection key={section.id} section={section} />
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
