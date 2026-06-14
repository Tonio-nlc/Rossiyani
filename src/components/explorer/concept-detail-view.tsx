import Link from "next/link";

import { getCaseLegendEntry } from "@/features/grammar/case-legend-data";
import type { ConceptKnowledge } from "@/types/knowledge-graph";
import { practicePath } from "@/lib/practice/constants";

import { ExplorerDiscoveryGrid } from "./explorer-discovery-grid";
import { ExplorerLayout } from "./explorer-layout";
import { endingPath, lemmaPath, textPath, conceptPath } from "./explorer-routes";
import {
  collocationChip,
  conceptChip,
  endingChip,
  expressionChip,
  lemmaChip,
  RelatedNavigation,
  textChip,
} from "./related-navigation";

type ConceptDetailViewProps = {
  concept: ConceptKnowledge;
  relatedTexts: Array<{ textId: string; textTitle: string; sentenceRussian: string }>;
};

function JourneySection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <p className="home-section-label">{label}</p>
      {children}
    </section>
  );
}

function grammaticalQuestion(concept: ConceptKnowledge): string | null {
  const caseNode = concept.cases[0];
  if (caseNode) {
    const legend = getCaseLegendEntry(caseNode.caseKey as import("@/features/grammar").CaseKey);
    return legend?.question ?? caseNode.titleFr;
  }
  if (concept.concept.category === "GRAMMATICAL_CASE") {
    return "Quelle fonction grammaticale ce concept décrit-il ?";
  }
  return null;
}

export function ConceptDetailView({ concept, relatedTexts }: ConceptDetailViewProps) {
  const question = grammaticalQuestion(concept);
  const primaryText = relatedTexts[0];

  const related = [
    ...concept.relatedConcepts.slice(0, 6).map((c) => conceptChip(c.conceptKey, c.title)),
    ...concept.lemmas.slice(0, 4).map((l) => lemmaChip(l.lemma, l.partOfSpeech)),
    ...concept.phrases.slice(0, 4).map((p) =>
      p.type === "COLLOCATION" ? collocationChip(p.label) : expressionChip(p.label),
    ),
    ...concept.endings.slice(0, 4).map((e) => endingChip(e.ending, e.caseKey)),
    ...relatedTexts.slice(0, 3).map((t) => textChip(t.textId, t.textTitle)),
  ];

  return (
    <ExplorerLayout
      breadcrumb={[{ label: "Explorer", href: "/explorer" }, { label: concept.concept.title }]}
    >
      <article className="space-y-12 pb-8">
        <header className="space-y-4">
          <p className="font-reader text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight text-[var(--ink)]">
            {concept.concept.title}
          </p>
          <p className="text-sm text-[var(--ink-muted)]">
            {concept.concept.hitCount.toLocaleString("fr-FR")} occurrences ·{" "}
            {concept.stats.lemmaCount} lemmes
          </p>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
            {primaryText ? (
              <li>
                <Link
                  href={textPath(primaryText.textId)}
                  className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
                >
                  See authentic examples →
                </Link>
              </li>
            ) : null}
            <li>
              <Link
                href={practicePath({
                  structure: concept.concept.title,
                  mode: "structure",
                  from: "explorer",
                })}
                className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
              >
                Practice this construction →
              </Link>
            </li>
          </ul>
        </header>

        <JourneySection label="Meaning">
          {question ? (
            <p className="mb-3 font-reader text-lg text-[var(--ink)]">{question}</p>
          ) : null}
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
            {concept.concept.canonicalExplanation}
          </p>
          {concept.concept.frenchComparison ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
              {concept.concept.frenchComparison}
            </p>
          ) : null}
        </JourneySection>

        {concept.lemmas.length > 0 ? (
          <JourneySection label="Frequently used">
            <ExplorerDiscoveryGrid
              items={concept.lemmas.slice(0, 12).map((lemma) => ({
                label: lemma.lemma,
                href: lemmaPath(lemma.lemma, lemma.partOfSpeech),
              }))}
            />
          </JourneySection>
        ) : null}

        {relatedTexts.length > 0 ? (
          <JourneySection label="Reader">
            <div className="grid gap-3 lg:grid-cols-2">
              {relatedTexts.map((text) => (
                <Link
                  key={`${text.textId}-${text.sentenceRussian.slice(0, 20)}`}
                  href={textPath(text.textId)}
                  className="focus-kb group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4 transition hover:border-[var(--ink-muted)]"
                >
                  <p className="text-sm font-medium text-[var(--ink)]">{text.textTitle}</p>
                  <p className="mt-2 flex-1 font-reader text-sm leading-relaxed text-[var(--ink-secondary)]">
                    {text.sentenceRussian}
                  </p>
                  <span className="mt-4 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
                    Read examples →
                  </span>
                </Link>
              ))}
            </div>
          </JourneySection>
        ) : null}

        <JourneySection label="Practice">
          <Link
            href={practicePath({
              structure: concept.concept.title,
              mode: "structure",
              from: "explorer",
            })}
            className="focus-kb group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-5 transition hover:border-[var(--ink-muted)]"
          >
            <p className="font-reader text-lg text-[var(--ink)] group-hover:text-[var(--color-link)]">
              Write your own sentence
            </p>
            <p className="mt-2 text-sm text-[var(--ink-secondary)]">
              Practice <span className="font-reader">{concept.concept.title}</span> in context.
            </p>
            <span className="mt-4 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
              Practice this →
            </span>
          </Link>
        </JourneySection>

        {concept.relatedConcepts.length > 0 ? (
          <JourneySection label="Related concepts">
            <ExplorerDiscoveryGrid
              items={concept.relatedConcepts.map((relatedConcept) => ({
                label: relatedConcept.title,
                href: conceptPath(relatedConcept.conceptKey),
              }))}
            />
          </JourneySection>
        ) : null}

        {concept.endings.length > 0 ? (
          <JourneySection label="Related forms">
            <ExplorerDiscoveryGrid
              items={concept.endings.map((ending) => ({
                label: `-${ending.ending}`,
                href: endingPath(ending.ending, ending.caseKey),
                meta: ending.caseKey ?? undefined,
              }))}
            />
          </JourneySection>
        ) : null}

        <RelatedNavigation items={related} />
      </article>
    </ExplorerLayout>
  );
}
