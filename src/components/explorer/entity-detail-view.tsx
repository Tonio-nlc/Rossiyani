import Link from "next/link";

import type { ExplorerEntityPageData, ExplorerEntityPick } from "@/features/explorer/entity";
import {
  tutorSimpleExplanationFromEntity,
  tutorWhyFromEntity,
} from "@/lib/explorer/tutor-copy";
import { practicePath } from "@/lib/practice/constants";

import { ExplorerLayout } from "./explorer-layout";
import { ExplorerDiscoveryGrid } from "./explorer-discovery-grid";
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
import { textPath } from "./explorer-routes";

type EntityDetailViewProps = {
  data: ExplorerEntityPageData;
};

function EntityBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1 text-xs font-medium tracking-wide text-[var(--ink-secondary)]">
      {label}
    </span>
  );
}

function PickGrid({ items }: { items: ExplorerEntityPick[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ExplorerDiscoveryGrid
      items={items.map((item) => ({
        label: item.label,
        href: item.href,
        meta: item.meta,
      }))}
    />
  );
}

export function EntityDetailView({ data }: EntityDetailViewProps) {
  const primaryExample = data.examples[0] ?? data.relatedTexts[0];
  const primaryLesson = data.relatedLessons[0];
  const readExamplesHref = data.relatedTexts[0]?.textId
    ? textPath(data.relatedTexts[0].textId)
    : null;
  const explanation = tutorSimpleExplanationFromEntity(data);
  const secondaryActions = [
    readExamplesHref
      ? { label: "Lire dans vos textes", href: readExamplesHref }
      : null,
    primaryLesson
      ? { label: "Ouvrir la leçon", href: `/manual/lecons/${primaryLesson.slug}` }
      : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <ExplorerLayout breadcrumb={data.breadcrumb}>
      <article className="space-y-10 pb-12">
        <ExplorerTutorTitle label={data.label} translation={data.translation} />

        <ExplorerTutorWhy text={tutorWhyFromEntity(data)} />

        {primaryExample ? (
          <ExplorerTutorExample
            russian={primaryExample.russian}
            translation={primaryExample.translation}
            explanation={primaryExample.explanation}
            sourceHref={primaryExample.textId ? textPath(primaryExample.textId) : null}
            sourceLabel={primaryExample.textTitle ?? null}
          />
        ) : null}

        <ExplorerTutorExplanation text={explanation} commonMistakes={data.commonMistakes} />

        <ExplorerTutorAction
          primary={{
            label: "Pratiquer maintenant",
            href: practicePath({
              structure: data.practiceStructure,
              mode: "structure",
              from: "explorer",
            }),
            description: "Écrivez une phrase avec cette structure et recevez un retour détaillé.",
          }}
          secondary={secondaryActions}
        />

        <ExplorerTutorAdvanced>
          <ExplorerTutorAdvancedSection label="Type et niveau">
            <div className="flex flex-wrap items-center gap-2">
              <EntityBadge label={data.typeLabel} />
              {data.badges.map((badge) => (
                <EntityBadge key={badge.label} label={badge.label} />
              ))}
            </div>
            {data.metadataLine ? (
              <ExplorerTutorMetaLine>{data.metadataLine}</ExplorerTutorMetaLine>
            ) : null}
            {data.heroSummary ? (
              <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
                {data.heroSummary}
              </p>
            ) : null}
          </ExplorerTutorAdvancedSection>

          {data.examples.length > 1 ? (
            <ExplorerTutorAdvancedSection label="Autres exemples">
              <ul className="grid gap-4 lg:grid-cols-2">
                {data.examples.slice(1).map((example, index) => (
                  <li
                    key={`${example.russian}-${index}`}
                    className="ds-microscope-panel"
                  >
                    <p className="break-russian font-reader text-base leading-snug text-[var(--ink)]">
                      {example.russian}
                    </p>
                    {example.translation ? (
                      <p className="mt-2 text-sm text-[var(--ink-secondary)]">
                        {example.translation}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </ExplorerTutorAdvancedSection>
          ) : null}

          {data.relatedConcepts.length > 0 ? (
            <ExplorerTutorAdvancedSection label="Concepts liés">
              <PickGrid items={data.relatedConcepts} />
            </ExplorerTutorAdvancedSection>
          ) : null}

          {data.relatedGrammar.length > 0 ? (
            <ExplorerTutorAdvancedSection label="Grammaire liée">
              <PickGrid items={data.relatedGrammar} />
            </ExplorerTutorAdvancedSection>
          ) : null}

          {data.relatedTexts.length > 0 ? (
            <ExplorerTutorAdvancedSection label="Dans vos textes">
              <div className="grid gap-4 lg:grid-cols-2">
                {data.relatedTexts.map((text) => (
                  <Link
                    key={`${text.textId ?? text.russian}`}
                    href={text.textId ? textPath(text.textId) : "#"}
                    className="focus-kb ds-microscope-panel transition hover:border-[var(--hairline-strong)]"
                  >
                    {text.textTitle ? (
                      <p className="text-sm font-medium text-[var(--ink)]">{text.textTitle}</p>
                    ) : null}
                    <p className="mt-2 font-reader text-sm leading-relaxed text-[var(--ink-secondary)]">
                      {text.russian}
                    </p>
                  </Link>
                ))}
              </div>
              {data.textCount > 0 ? (
                <ExplorerTutorMetaLine>
                  Présent dans {data.textCount} texte{data.textCount > 1 ? "s" : ""}
                </ExplorerTutorMetaLine>
              ) : null}
            </ExplorerTutorAdvancedSection>
          ) : null}

          {data.relatedLessons.length > 0 ? (
            <ExplorerTutorAdvancedSection label="Leçons Manual">
              <div className="grid gap-4 lg:grid-cols-2">
                {data.relatedLessons.map((lesson) => (
                  <Link
                    key={lesson.slug}
                    href={`/manual/lecons/${lesson.slug}`}
                    className="focus-kb ds-microscope-panel transition hover:border-[var(--hairline-strong)]"
                  >
                    <p className="font-reader text-lg text-[var(--ink)]">{lesson.title}</p>
                    <p className="mt-1 text-sm text-[var(--ink-muted)]">{lesson.level}</p>
                  </Link>
                ))}
              </div>
            </ExplorerTutorAdvancedSection>
          ) : null}

          {data.continueExploring.length > 0 ? (
            <ExplorerTutorAdvancedSection label="Poursuivre l'exploration">
              <PickGrid items={data.continueExploring} />
            </ExplorerTutorAdvancedSection>
          ) : null}
        </ExplorerTutorAdvanced>
      </article>
    </ExplorerLayout>
  );
}
