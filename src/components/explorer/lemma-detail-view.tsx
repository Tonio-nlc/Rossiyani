import Link from "next/link";

import type { LemmaKnowledge } from "@/types/knowledge-graph";
import {
  isConceptExplorerEligible,
  isPhraseExplorerEligible,
} from "@/features/explorer/entity/explorer-eligibility";
import {
  buildFrequencyVisual,
  formatFormMorphLabel,
  formatPosLabelFr,
  isDisplayableEnding,
  renderFrequencyStars,
} from "@/lib/explorer/lemma-display";
import {
  tutorSimpleExplanationFromLemma,
  tutorWhyFromLemma,
} from "@/lib/explorer/tutor-copy";
import { practicePath } from "@/lib/practice/constants";

import { EndingBadge } from "@/components/analysis/ending-badge";

import { ExplorerDiscoveryGrid } from "./explorer-discovery-grid";
import { ExplorerLayout } from "./explorer-layout";
import {
  collocationPath,
  conceptPath,
  expressionPath,
  endingPath,
  lemmaPath,
  textPath,
} from "./explorer-routes";
import {
  ExplorerTutorAction,
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
  expressionChip,
  lemmaChip,
  lessonChip,
  textChip,
} from "./related-navigation";

type LemmaDetailViewProps = {
  knowledge: LemmaKnowledge;
};

function formRowHref(form: LemmaKnowledge["forms"][number]): string {
  if (isDisplayableEnding(form.ending)) {
    return endingPath(form.ending, form.case);
  }
  return `/explorer?q=${encodeURIComponent(form.original)}`;
}

export function LemmaDetailView({ knowledge }: LemmaDetailViewProps) {
  const posLabel = formatPosLabelFr(knowledge.partOfSpeech);
  const frequency = buildFrequencyVisual(
    knowledge.frequency,
    knowledge.frequencyTier,
    knowledge.occurrenceCount,
  );
  const allConcepts = [...knowledge.concepts];
  const conceptIds = new Set(knowledge.concepts.map((concept) => concept.id));
  for (const concept of knowledge.relatedConcepts) {
    if (!conceptIds.has(concept.id)) {
      allConcepts.push(concept);
      conceptIds.add(concept.id);
    }
  }

  const collocations = knowledge.phrases.filter(
    (phrase) => phrase.type === "COLLOCATION" && isPhraseExplorerEligible(phrase.label, phrase.type),
  );
  const relatedConceptPhrases = knowledge.phrases.filter(
    (phrase) => phrase.type !== "COLLOCATION" && isPhraseExplorerEligible(phrase.label, phrase.type),
  );
  const eligibleConcepts = allConcepts.filter((concept) =>
    isConceptExplorerEligible(concept.conceptKey, concept.title, concept.category),
  );
  const familyTitle = knowledge.partOfSpeech === "verb" ? "Verbes associés" : "Mots associés";
  const primaryLesson = knowledge.relatedLessons[0];
  const primaryExample = knowledge.examples[0];
  const primaryText = knowledge.textsWithStats[0];
  const readExamplesHref = primaryText
    ? textPath(primaryText.textId)
    : knowledge.examples.find((example) => example.textId)?.textId
      ? textPath(knowledge.examples.find((example) => example.textId)!.textId!)
      : null;

  const morphRows = [
    { label: "Lemme", value: knowledge.lemma },
    knowledge.dominantAspect ? { label: "Aspect", value: knowledge.dominantAspect } : null,
    knowledge.aspectPartner
      ? {
          label: knowledge.dominantAspect?.includes("Perfectif")
            ? "Imperfectif associé"
            : "Perfectif associé",
          value: knowledge.aspectPartner.lemma,
          href: lemmaPath(knowledge.aspectPartner.lemma, knowledge.aspectPartner.partOfSpeech),
        }
      : null,
    knowledge.stressMarked ? { label: "Accent", value: knowledge.stressMarked } : null,
  ].filter((row): row is { label: string; value: string; href?: string } => Boolean(row));

  const relatedItems = [
    ...knowledge.familyLemmas.slice(0, 4).map((item) => lemmaChip(item.lemma, item.partOfSpeech)),
    ...collocations.slice(0, 3).map((phrase) => collocationChip(phrase.label)),
    ...relatedConceptPhrases.slice(0, 3).map((phrase) => expressionChip(phrase.label)),
    ...eligibleConcepts.slice(0, 4).map((concept) => conceptChip(concept.conceptKey, concept.title)),
    ...knowledge.relatedLessons.slice(0, 2).map((lesson) => lessonChip(lesson.slug, lesson.title)),
    ...knowledge.textsWithStats.slice(0, 2).map((text) => textChip(text.textId, text.textTitle)),
  ];

  const secondaryActions = [
    readExamplesHref ? { label: "Lire des exemples", href: readExamplesHref } : null,
    primaryLesson
      ? { label: "Ouvrir la leçon", href: `/manual/lecons/${primaryLesson.slug}` }
      : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <ExplorerLayout
      breadcrumb={[{ label: "Explorer", href: "/explorer" }, { label: knowledge.lemma }]}
    >
      <article className="space-y-10 pb-12">
        <ExplorerTutorTitle
          label={knowledge.stressMarked ?? knowledge.lemma}
          translation={knowledge.primaryTranslation}
        />

        <ExplorerTutorWhy text={tutorWhyFromLemma(knowledge)} />

        {primaryExample ? (
          <ExplorerTutorExample
            russian={primaryExample.sentenceRussian}
            translation={primaryExample.naturalTranslation}
            sourceHref={primaryExample.textId ? textPath(primaryExample.textId) : null}
            sourceTitle={primaryExample.textTitle ?? null}
            sourceCollectionId={primaryExample.collectionId ?? null}
          />
        ) : primaryText ? (
          <ExplorerTutorExample
            russian={primaryText.sentenceRussian}
            sourceHref={textPath(primaryText.textId)}
            sourceTitle={primaryText.textTitle}
            sourceCollectionId={primaryText.collectionId ?? null}
          />
        ) : null}

        <ExplorerTutorExplanation text={tutorSimpleExplanationFromLemma(knowledge)} />

        <ExplorerTutorAction
          primary={{
            label: "Pratiquer ce mot",
            href: practicePath({
              structure: knowledge.lemma,
              mode: "structure",
              from: "explorer",
            }),
            description: `Utilisez ${knowledge.lemma} dans une phrase que vous pourriez dire.`,
          }}
          secondary={secondaryActions}
        />

        <ExplorerTutorAdvanced>
          <ExplorerTutorAdvancedSection label="Profil">
            <ExplorerTutorMetaLine>
              {posLabel} · {knowledge.occurrenceCount.toLocaleString("fr-FR")} occurrences ·{" "}
              {knowledge.seenInTexts} texte{knowledge.seenInTexts > 1 ? "s" : ""}
            </ExplorerTutorMetaLine>
            {frequency ? (
              <p className="text-sm text-[var(--ink-muted)]" aria-label={frequency.label}>
                <span className="tracking-wider">{renderFrequencyStars(frequency.filledStars)}</span>
                <span className="ml-2 text-[var(--ink-muted)]">{frequency.label}</span>
              </p>
            ) : null}
          </ExplorerTutorAdvancedSection>

          {knowledge.examples.length > 1 ? (
            <ExplorerTutorAdvancedSection label="Autres exemples">
              <ul className="grid gap-3 lg:grid-cols-2">
                {knowledge.examples.slice(1).map((example) => (
                  <li
                    key={example.id}
                    className="ds-microscope-panel"
                  >
                    <p className="break-russian font-reader text-sm leading-relaxed text-[var(--ink)]">
                      {example.sentenceRussian}
                    </p>
                    {example.naturalTranslation ? (
                      <p className="mt-2 text-sm text-[var(--ink-secondary)]">
                        {example.naturalTranslation}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </ExplorerTutorAdvancedSection>
          ) : null}

          {knowledge.familyLemmas.length > 0 ? (
            <ExplorerTutorAdvancedSection label={familyTitle}>
              <ExplorerDiscoveryGrid
                items={knowledge.familyLemmas.map((item) => ({
                  label: item.lemma,
                  href: lemmaPath(item.lemma, item.partOfSpeech),
                }))}
              />
            </ExplorerTutorAdvancedSection>
          ) : null}

          {collocations.length > 0 ? (
            <ExplorerTutorAdvancedSection label="Constructions fréquentes">
              <ExplorerDiscoveryGrid
                items={collocations.map((phrase) => ({
                  label: phrase.label,
                  href: collocationPath(phrase.label),
                  meta: `${phrase.occurrenceCount}× dans vos textes`,
                }))}
              />
            </ExplorerTutorAdvancedSection>
          ) : null}

          {(eligibleConcepts.length > 0 || relatedConceptPhrases.length > 0) ? (
            <ExplorerTutorAdvancedSection label="Concepts liés">
              <ExplorerDiscoveryGrid
                items={[
                  ...relatedConceptPhrases.map((phrase) => ({
                    label: phrase.label,
                    href: expressionPath(phrase.label),
                    meta: `${phrase.occurrenceCount}×`,
                  })),
                  ...eligibleConcepts.map((concept) => ({
                    label: concept.title,
                    href: conceptPath(concept.conceptKey),
                  })),
                ]}
              />
            </ExplorerTutorAdvancedSection>
          ) : null}

          {morphRows.length > 1 ? (
            <ExplorerTutorAdvancedSection label="Notes grammaticales">
              <dl className="grid gap-3 sm:grid-cols-2">
                {morphRows.map((row) => (
                  <div
                    key={row.label}
                    className="ds-microscope-panel"
                  >
                    <dt className="text-xs text-[var(--ink-muted)]">{row.label}</dt>
                    <dd className="mt-1 font-reader text-lg text-[var(--ink)]">
                      {"href" in row && row.href ? (
                        <Link href={row.href} className="focus-kb hover:text-[var(--color-link)]">
                          {row.value}
                        </Link>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </ExplorerTutorAdvancedSection>
          ) : null}

          {knowledge.forms.length > 0 ? (
            <ExplorerTutorAdvancedSection label="Formes rencontrées">
              <div className="overflow-x-auto border border-[var(--hairline)]">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--hairline)] bg-[var(--surface)] text-left text-xs text-[var(--ink-muted)]">
                      <th className="px-4 py-3">Forme</th>
                      <th className="px-4 py-3">Cas / Temps</th>
                      <th className="px-4 py-3 text-right">Occurrences</th>
                    </tr>
                  </thead>
                  <tbody>
                    {knowledge.forms.map((form) => {
                      const morphLabel = formatFormMorphLabel(form, knowledge.partOfSpeech);
                      return (
                        <tr key={form.id} className="border-b border-[var(--hairline)] last:border-0">
                          <td className="px-4 py-0">
                            <Link
                              href={formRowHref(form)}
                              className="focus-kb flex items-center gap-2 py-3 font-reader font-medium transition hover:text-[var(--color-link)]"
                            >
                              {form.original}
                              {isDisplayableEnding(form.ending) ? (
                                <EndingBadge
                                  endingText={`-${form.ending}`}
                                  grammaticalCase={form.case}
                                />
                              ) : null}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-[var(--ink-muted)]">{morphLabel ?? ""}</td>
                          <td className="px-4 py-3 text-right text-[var(--ink-muted)]">
                            {form.occurrenceCount.toLocaleString("fr-FR")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </ExplorerTutorAdvancedSection>
          ) : null}

          {knowledge.textsWithStats.length > 0 ? (
            <ExplorerTutorAdvancedSection label="Dans vos textes">
              <div className="grid gap-3 lg:grid-cols-2">
                {knowledge.textsWithStats.map((text) => (
                  <Link
                    key={text.textId}
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

          <RelatedNavigation items={relatedItems} />
        </ExplorerTutorAdvanced>
      </article>
    </ExplorerLayout>
  );
}
