import Link from "next/link";

import { getCaseLegendEntry } from "@/features/grammar/case-legend-data";
import type { ConceptKnowledge } from "@/types/knowledge-graph";
import {
  tutorSimpleExplanationFromConcept,
  tutorWhyFromConcept,
} from "@/lib/explorer/tutor-copy";
import { practicePath } from "@/lib/practice/constants";

import { GhostButton } from "@/components/design-system";

import { ExplorerDiscoveryGrid } from "./explorer-discovery-grid";
import { endingPath, lemmaPath, textPath, conceptPath } from "./explorer-routes";
import {
  ExplorerTutorAdvanced,
  ExplorerTutorAdvancedSection,
  ExplorerTutorExample,
  ExplorerTutorExplanation,
  ExplorerTutorMetaLine,
  ExplorerTutorTitle,
  ExplorerTutorWhy,
} from "./explorer-tutor-sections";
import { RelatedNavigation } from "./related-navigation";
import {
  collocationChip,
  conceptChip,
  endingChip,
  expressionChip,
  lemmaChip,
  textChip,
} from "./related-navigation";

type ConceptDetailViewProps = {
  concept: ConceptKnowledge;
  relatedTexts: Array<{ textId: string; textTitle: string; sentenceRussian: string }>;
};

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
  const readExamplesHref = primaryText ? textPath(primaryText.textId) : null;

  const related = [
    ...concept.relatedConcepts.slice(0, 6).map((item) => conceptChip(item.conceptKey, item.title)),
    ...concept.lemmas.slice(0, 4).map((item) => lemmaChip(item.lemma, item.partOfSpeech)),
    ...concept.phrases.slice(0, 4).map((item) =>
      item.type === "COLLOCATION" ? collocationChip(item.label) : expressionChip(item.label),
    ),
    ...concept.endings.slice(0, 4).map((item) => endingChip(item.ending, item.caseKey)),
    ...relatedTexts.slice(0, 3).map((item) => textChip(item.textId, item.textTitle)),
  ];

  const practiceHref = practicePath({
    structure: concept.concept.title,
    mode: "structure",
    from: "explorer",
  });

  return (
    <div className="explorer-workspace-pane explorer-workspace-pane--detail">
      <article className="explorer-word">
        <ExplorerTutorTitle label={concept.concept.title} />

        <ExplorerTutorWhy text={tutorWhyFromConcept(concept, question)} />

        <div className="editorial-page-section pb-0">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <GhostButton href={practiceHref}>Pratiquer →</GhostButton>
            </li>
            {readExamplesHref ? (
              <li>
                <GhostButton href={readExamplesHref}>Lire →</GhostButton>
              </li>
            ) : null}
          </ul>
        </div>

        {primaryText ? (
          <ExplorerTutorExample russian={primaryText.sentenceRussian} />
        ) : null}

        <ExplorerTutorExplanation text={tutorSimpleExplanationFromConcept(concept)} />

        <ExplorerTutorAdvanced>
          <ExplorerTutorAdvancedSection label="Statistiques">
            <ExplorerTutorMetaLine>
              {concept.concept.hitCount.toLocaleString("fr-FR")} occurrences ·{" "}
              {concept.stats.lemmaCount} lemmes associés
            </ExplorerTutorMetaLine>
          </ExplorerTutorAdvancedSection>

          {question ? (
            <ExplorerTutorAdvancedSection label="Question grammaticale">
              <p className="font-reader text-lg text-[var(--ink)]">{question}</p>
            </ExplorerTutorAdvancedSection>
          ) : null}

          {concept.lemmas.length > 0 ? (
            <ExplorerTutorAdvancedSection label="Lemmes fréquents">
              <ExplorerDiscoveryGrid
                items={concept.lemmas.slice(0, 12).map((lemma) => ({
                  label: lemma.lemma,
                  href: lemmaPath(lemma.lemma, lemma.partOfSpeech),
                }))}
              />
            </ExplorerTutorAdvancedSection>
          ) : null}

          {relatedTexts.length > 1 ? (
            <ExplorerTutorAdvancedSection label="Autres occurrences">
              <div className="grid gap-3 lg:grid-cols-2">
                {relatedTexts.slice(1).map((text) => (
                  <Link
                    key={`${text.textId}-${text.sentenceRussian.slice(0, 20)}`}
                    href={textPath(text.textId)}
                    className="focus-kb ds-microscope-panel transition hover:border-[var(--hairline-strong)]"
                  >
                    <p className="text-sm font-medium text-[var(--ink)]">{text.textTitle}</p>
                    <p className="mt-2 font-reader text-sm leading-relaxed text-[var(--ink-secondary)]">
                      {text.sentenceRussian}
                    </p>
                  </Link>
                ))}
              </div>
            </ExplorerTutorAdvancedSection>
          ) : null}

          {concept.relatedConcepts.length > 0 ? (
            <ExplorerTutorAdvancedSection label="Concepts voisins">
              <ExplorerDiscoveryGrid
                items={concept.relatedConcepts.map((item) => ({
                  label: item.title,
                  href: conceptPath(item.conceptKey),
                }))}
              />
            </ExplorerTutorAdvancedSection>
          ) : null}

          {concept.endings.length > 0 ? (
            <ExplorerTutorAdvancedSection label="Formes liées">
              <ExplorerDiscoveryGrid
                items={concept.endings.map((ending) => ({
                  label: `-${ending.ending}`,
                  href: endingPath(ending.ending, ending.caseKey),
                  meta: ending.caseKey ?? undefined,
                }))}
              />
            </ExplorerTutorAdvancedSection>
          ) : null}

          <RelatedNavigation items={related} />
        </ExplorerTutorAdvanced>
      </article>
    </div>
  );
}
