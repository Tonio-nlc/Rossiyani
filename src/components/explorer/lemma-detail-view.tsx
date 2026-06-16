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
  collocationChip,
  conceptChip,
  expressionChip,
  lemmaChip,
  lessonChip,
  RelatedNavigation,
  textChip,
} from "./related-navigation";

type LemmaDetailViewProps = {
  knowledge: LemmaKnowledge;
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
  const familyTitle =
    knowledge.partOfSpeech === "verb" ? "Related verbs" : "Related words";
  const primaryLesson = knowledge.relatedLessons[0];
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

  return (
    <ExplorerLayout
      breadcrumb={[{ label: "Explorer", href: "/explorer" }, { label: knowledge.lemma }]}
    >
      <article className="space-y-12 pb-8">
        <header className="space-y-4">
          <p className="break-russian font-reader text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.02] tracking-tight text-[var(--ink)]">
            {knowledge.stressMarked ?? knowledge.lemma}
          </p>
          <p className="text-sm text-[var(--ink-muted)]">
            {posLabel} · {knowledge.occurrenceCount.toLocaleString("fr-FR")} occurrences ·{" "}
            {knowledge.seenInTexts} texte{knowledge.seenInTexts > 1 ? "s" : ""}
          </p>
          {frequency ? (
            <p className="text-sm text-amber-500" aria-label={frequency.label}>
              <span className="tracking-wider">{renderFrequencyStars(frequency.filledStars)}</span>
              <span className="ml-2 text-[var(--ink-muted)]">{frequency.label}</span>
            </p>
          ) : null}

          {(knowledge.primaryTranslation || knowledge.simpleExplanation) && (
            <div className="max-w-2xl space-y-2 pt-2">
              <p className="home-section-label">Meaning</p>
              {knowledge.primaryTranslation ? (
                <p className="font-reader text-xl text-[var(--ink)]">
                  {knowledge.primaryTranslation}
                </p>
              ) : null}
              {knowledge.simpleExplanation ? (
                <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                  {knowledge.simpleExplanation}
                </p>
              ) : null}
              {knowledge.secondaryTranslations.length > 0 ? (
                <p className="text-sm text-[var(--ink-secondary)]">
                  Also: {knowledge.secondaryTranslations.join(" · ")}
                </p>
              ) : null}
            </div>
          )}

          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm font-medium">
            {readExamplesHref ? (
              <li>
                <Link
                  href={readExamplesHref}
                  className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
                >
                  Read examples →
                </Link>
              </li>
            ) : null}
            <li>
              <Link
                href={practicePath({
                  structure: knowledge.lemma,
                  mode: "structure",
                  from: "explorer",
                })}
                className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
              >
                Practice this →
              </Link>
            </li>
            {primaryLesson ? (
              <li>
                <Link
                  href={`/manual/lecons/${primaryLesson.slug}`}
                  className="focus-kb text-[var(--ink)] underline-offset-2 hover:underline"
                >
                  Open lesson →
                </Link>
              </li>
            ) : null}
          </ul>
        </header>

        {knowledge.examples.length > 0 ? (
          <JourneySection label="How Russians actually use it">
            <ul className="grid gap-3 lg:grid-cols-2">
              {knowledge.examples.map((example) => (
                <li
                  key={example.id}
                  className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4"
                >
                  <p className="break-russian font-reader text-sm leading-relaxed text-[var(--ink)]">
                    {example.sentenceRussian}
                  </p>
                  {example.naturalTranslation ? (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
                      {example.naturalTranslation}
                    </p>
                  ) : null}
                  {example.textId && example.textTitle ? (
                    <Link
                      href={textPath(example.textId)}
                      className="focus-kb mt-3 inline-block text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--color-link)]"
                    >
                      {example.textTitle} →
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </JourneySection>
        ) : null}

        {knowledge.familyLemmas.length > 0 ? (
          <JourneySection label={familyTitle}>
            <ExplorerDiscoveryGrid
              items={knowledge.familyLemmas.map((item) => ({
                label: item.lemma,
                href: lemmaPath(item.lemma, item.partOfSpeech),
              }))}
            />
          </JourneySection>
        ) : null}

        {collocations.length > 0 ? (
          <JourneySection label="Common constructions">
            <ExplorerDiscoveryGrid
              items={collocations.map((phrase) => ({
                label: phrase.label,
                href: collocationPath(phrase.label),
                meta: `${phrase.occurrenceCount}× in your texts`,
              }))}
            />
          </JourneySection>
        ) : null}

        {knowledge.relatedLessons.length > 0 ? (
          <JourneySection label="Manual">
            {knowledge.relatedLessons.map((lesson) => (
              <Link
                key={lesson.slug}
                href={`/manual/lecons/${lesson.slug}`}
                className="focus-kb group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-5 transition hover:border-[var(--ink-muted)]"
              >
                <p className="text-sm text-[var(--ink-muted)]">Lesson</p>
                <p className="mt-1 font-reader text-lg text-[var(--ink)] group-hover:text-[var(--color-link)]">
                  {lesson.title}
                </p>
                <span className="mt-3 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
                  Open lesson →
                </span>
              </Link>
            ))}
          </JourneySection>
        ) : null}

        {knowledge.textsWithStats.length > 0 ? (
          <JourneySection label="Reader">
            <p className="text-sm text-[var(--ink-secondary)]">
              Found in {knowledge.textsWithStats.length} text
              {knowledge.textsWithStats.length > 1 ? "s" : ""}
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
              {knowledge.textsWithStats.map((text) => (
                <Link
                  key={text.textId}
                  href={textPath(text.textId)}
                  className="focus-kb group flex h-full flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4 transition hover:border-[var(--ink-muted)]"
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
              structure: knowledge.lemma,
              mode: "structure",
              from: "explorer",
            })}
            className="focus-kb group flex flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-5 transition hover:border-[var(--ink-muted)]"
          >
            <p className="font-reader text-lg text-[var(--ink)] group-hover:text-[var(--color-link)]">
              Write your own sentence
            </p>
            <p className="mt-2 text-sm text-[var(--ink-secondary)]">
              Use <span className="font-reader">{knowledge.lemma}</span> in context and get feedback.
            </p>
            <span className="mt-4 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
              Practice this →
            </span>
          </Link>
        </JourneySection>

        {(eligibleConcepts.length > 0 || relatedConceptPhrases.length > 0) ? (
          <JourneySection label="Related concepts">
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
          </JourneySection>
        ) : null}

        {morphRows.length > 1 ? (
          <JourneySection label="Grammar notes">
            <dl className="grid gap-3 sm:grid-cols-2">
              {morphRows.map((row) => (
                <div
                  key={row.label}
                  className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-4 py-3"
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
          </JourneySection>
        ) : null}

        {knowledge.forms.length > 0 ? (
          <JourneySection label="Forms encountered">
            <div className="overflow-x-auto rounded-2xl border border-[var(--hairline)]">
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
          </JourneySection>
        ) : null}

        <RelatedNavigation items={relatedItems} />
      </article>
    </ExplorerLayout>
  );
}
