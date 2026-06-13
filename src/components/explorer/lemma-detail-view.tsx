import Link from "next/link";

import { PHRASE_GROUP_TYPE_LABELS } from "@/types/domain";
import type { LemmaKnowledge } from "@/types/knowledge-graph";
import {
  buildFrequencyVisual,
  formatFormMorphLabel,
  formatPosLabelFr,
  isDisplayableEnding,
  renderFrequencyStars,
} from "@/lib/explorer/lemma-display";

import { EndingBadge } from "@/components/analysis/ending-badge";
import { practicePath } from "@/lib/practice/constants";

import { ExplorerLayout } from "./explorer-layout";
import {
  collocationPath,
  conceptPath,
  endingPath,
  expressionPath,
  lemmaPath,
  textPath,
} from "./explorer-routes";
import {
  conceptChip,
  endingChip,
  lemmaChip,
  lessonChip,
  RelatedNavigation,
  textChip,
} from "./related-navigation";

type LemmaDetailViewProps = {
  knowledge: LemmaKnowledge;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
      {children}
    </h2>
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

  const hasSens =
    knowledge.primaryTranslation ||
    knowledge.simpleExplanation ||
    knowledge.secondaryTranslations.length > 0;

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

  const continueItems = [
    ...knowledge.forms
      .filter((form) => isDisplayableEnding(form.ending))
      .slice(0, 3)
      .map((form) => endingChip(form.ending, form.case)),
    ...allConcepts.slice(0, 4).map((concept) => conceptChip(concept.conceptKey, concept.title)),
    ...knowledge.textsWithStats.slice(0, 3).map((text) => textChip(text.textId, text.textTitle)),
    ...knowledge.familyLemmas.slice(0, 3).map((item) => lemmaChip(item.lemma, item.partOfSpeech)),
    ...knowledge.relatedLessons.slice(0, 2).map((lesson) => lessonChip(lesson.slug, lesson.title)),
  ];

  return (
    <ExplorerLayout
      breadcrumb={[{ label: "Lemmes", href: "/explorer/lemmas" }, { label: knowledge.lemma }]}
    >
      <article className="space-y-10 pb-4">
        <header className="space-y-5 rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--accent-violet)]/10 to-[var(--surface-elevated)] p-6 shadow-[var(--shadow-soft)]">
          <div className="space-y-2">
            <p className="break-russian font-reader text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight text-[var(--foreground)]">
              {knowledge.stressMarked ?? knowledge.lemma}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {posLabel} · {knowledge.occurrenceCount.toLocaleString("fr-FR")} occurrences ·{" "}
              {knowledge.seenInTexts} texte{knowledge.seenInTexts > 1 ? "s" : ""}
            </p>
            {knowledge.primaryTranslation ? (
              <p className="break-russian font-reader text-[clamp(1.125rem,2.5vw,1.5rem)] text-[var(--foreground)]">
                {knowledge.primaryTranslation}
              </p>
            ) : null}
            {frequency ? (
              <p className="text-sm text-amber-500" aria-label={frequency.label}>
                <span className="tracking-wider">{renderFrequencyStars(frequency.filledStars)}</span>
                <span className="ml-2 text-[var(--muted)]">{frequency.label}</span>
              </p>
            ) : null}
          </div>

          {allConcepts.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--muted)]">Concepts liés</p>
              <div className="flex flex-wrap gap-2">
                {allConcepts.slice(0, 6).map((concept) => (
                  <Link
                    key={concept.id}
                    href={conceptPath(concept.conceptKey)}
                    className="focus-kb rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-3 py-1 text-sm transition hover:border-[var(--accent-violet)]/40"
                  >
                    {concept.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </header>

        {hasSens ? (
          <section className="space-y-3">
            <SectionTitle>Sens</SectionTitle>
            <div className="surface-elevated rounded-2xl border border-[var(--border)] p-5">
              <p className="font-reader text-2xl font-medium text-[var(--foreground)]">
                {knowledge.lemma}
              </p>
              {knowledge.primaryTranslation ? (
                <p className="mt-2 text-lg text-[var(--foreground)]">{knowledge.primaryTranslation}</p>
              ) : null}
              {knowledge.simpleExplanation ? (
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {knowledge.simpleExplanation}
                </p>
              ) : null}
              {knowledge.secondaryTranslations.length > 0 ? (
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-medium text-[var(--muted)]">Peut aussi signifier :</p>
                  <ul className="space-y-1 text-sm text-[var(--foreground)]">
                    {knowledge.secondaryTranslations.map((meaning) => (
                      <li key={meaning}>• {meaning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {morphRows.length > 1 ? (
          <section className="space-y-3">
            <SectionTitle>Morphologie</SectionTitle>
            <dl className="grid gap-3 sm:grid-cols-2">
              {morphRows.map((row) => (
                <div
                  key={row.label}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
                >
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {row.label}
                  </dt>
                  <dd className="mt-1 font-reader text-lg text-[var(--foreground)]">
                    {"href" in row && row.href ? (
                      <Link href={row.href} className="focus-kb text-[var(--accent-violet-bright)] hover:underline">
                        {row.value}
                      </Link>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {knowledge.forms.length > 0 ? (
          <section className="space-y-3">
            <SectionTitle>Formes rencontrées</SectionTitle>
            <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    <th className="px-4 py-3">Forme</th>
                    <th className="px-4 py-3">Cas / Temps</th>
                    <th className="px-4 py-3 text-right">Occurrences</th>
                  </tr>
                </thead>
                <tbody>
                  {knowledge.forms.map((form) => {
                    const morphLabel = formatFormMorphLabel(form, knowledge.partOfSpeech);
                    return (
                      <tr key={form.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-0">
                          <Link
                            href={formRowHref(form)}
                            className="focus-kb flex items-center gap-2 py-3 font-reader font-medium transition hover:text-[var(--accent-violet-bright)]"
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
                        <td className="px-4 py-3 text-[var(--muted)]">{morphLabel ?? ""}</td>
                        <td className="px-4 py-3 text-right text-[var(--muted)]">
                          {form.occurrenceCount.toLocaleString("fr-FR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {knowledge.familyLemmas.length > 0 ? (
          <section className="space-y-3">
            <SectionTitle>Famille lexicale</SectionTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={lemmaPath(knowledge.lemma, knowledge.partOfSpeech)}
                className="focus-kb rounded-full border border-[var(--accent-violet)]/40 bg-[var(--accent-violet)]/10 px-3 py-1.5 font-reader text-sm font-medium"
              >
                {knowledge.lemma}
              </Link>
              {knowledge.familyLemmas.map((item) => (
                <span key={`${item.lemma}-${item.partOfSpeech}`} className="flex items-center gap-2">
                  <span className="text-[var(--muted)]" aria-hidden>
                    ↓
                  </span>
                  <Link
                    href={lemmaPath(item.lemma, item.partOfSpeech)}
                    className="focus-kb chip-transition rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-reader text-sm transition hover:border-[var(--accent-violet)]/40 hover:bg-[var(--surface-elevated)]"
                  >
                    {item.lemma}
                  </Link>
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {knowledge.phrases.length > 0 ? (
          <section className="space-y-3">
            <SectionTitle>Expressions</SectionTitle>
            <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              {knowledge.phrases.slice(0, 8).map((phrase) => {
                const href =
                  phrase.type === "COLLOCATION"
                    ? collocationPath(phrase.label)
                    : expressionPath(phrase.label);
                return (
                  <li key={phrase.id}>
                    <Link
                      href={href}
                      className="focus-kb flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-[var(--surface-elevated)]"
                    >
                      <span className="font-reader font-medium text-[var(--foreground)]">
                        {phrase.label}
                      </span>
                      <span className="shrink-0 text-xs text-[var(--muted)]">
                        {PHRASE_GROUP_TYPE_LABELS[phrase.type]} · {phrase.occurrenceCount}×
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {knowledge.examples.length > 0 ? (
          <section className="space-y-3">
            <SectionTitle>Exemples</SectionTitle>
            <ul className="space-y-3">
              {knowledge.examples.map((example) => (
                <li
                  key={example.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                >
                  <p className="font-reader text-sm leading-relaxed text-[var(--foreground)]">
                    {example.sentenceRussian}
                  </p>
                  {example.naturalTranslation ? (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                      {example.naturalTranslation}
                    </p>
                  ) : null}
                  {example.textId && example.textTitle ? (
                    <Link
                      href={textPath(example.textId)}
                      className="focus-kb mt-3 inline-block text-xs font-medium text-[var(--accent-violet-bright)] hover:underline"
                    >
                      {example.textTitle}
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {knowledge.textsWithStats.length > 0 ? (
          <section className="space-y-3">
            <SectionTitle>Textes</SectionTitle>
            <ul className="grid gap-3 lg:grid-cols-2">
              {knowledge.textsWithStats.map((text) => (
                <li
                  key={text.textId}
                  className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <p className="text-sm font-medium text-[var(--foreground)]">{text.textTitle}</p>
                  <p className="mt-2 flex-1 font-reader text-sm leading-relaxed text-[var(--muted)]">
                    {text.sentenceRussian}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-[var(--muted)]">
                      {text.occurrenceCount} occurrence{text.occurrenceCount > 1 ? "s" : ""}
                    </span>
                    <Link
                      href={textPath(text.textId)}
                      className="focus-kb rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium transition hover:border-[var(--accent-violet)]/40"
                    >
                      Ouvrir le texte
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {allConcepts.length > 0 ? (
          <section className="space-y-3">
            <SectionTitle>Concepts liés</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {allConcepts.map((concept) => (
                <Link
                  key={concept.id}
                  href={conceptPath(concept.conceptKey)}
                  className="focus-kb card-hover rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm transition hover:border-[var(--accent-violet)]/40"
                >
                  {concept.title}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {knowledge.relatedLessons.length > 0 ? (
          <section className="space-y-3">
            <SectionTitle>Leçons liées</SectionTitle>
            <ul className="space-y-2">
              {knowledge.relatedLessons.map((lesson) => (
                <li key={lesson.slug}>
                  <Link
                    href={`/manual/lecons/${lesson.slug}`}
                    className="focus-kb flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition hover:border-[var(--accent-violet)]/40 hover:bg-[var(--surface-elevated)]"
                  >
                    <span className="text-[var(--accent-violet-bright)]" aria-hidden>
                      ✓
                    </span>
                    <span className="font-medium text-[var(--foreground)]">{lesson.title}</span>
                    <span className="ml-auto text-xs text-[var(--muted)]">{lesson.level}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="space-y-2 border-t border-[var(--hairline)] pt-6">
          <Link
            href={practicePath({
              structure: knowledge.lemma,
              mode: "structure",
              from: "explorer",
            })}
            className="focus-kb text-sm font-medium text-[var(--foreground)] underline-offset-2 hover:underline"
          >
            Practice this construction →
          </Link>
        </section>

        <RelatedNavigation items={continueItems} />
      </article>
    </ExplorerLayout>
  );
}
