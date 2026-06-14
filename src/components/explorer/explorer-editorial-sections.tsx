import Link from "next/link";

import type { ExplorerEditorialData, ExplorerEditorialPick } from "@/features/explorer/get-explorer-editorial";
import { discoveryMetadataLine } from "@/features/discovery/discovery-metadata";

import { KnowledgeChain, MarginNote, Reference } from "@/components/editorial";

type ExplorerEditorialSectionsProps = {
  editorial: ExplorerEditorialData;
};

function EditorialCard({ pick }: { pick: ExplorerEditorialPick }) {
  return (
    <Link
      href={pick.href}
      className="focus-kb group flex h-full flex-col rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-4 transition hover:border-[var(--ink-muted)]"
    >
      <p className="break-russian font-reader text-lg text-[var(--ink)] group-hover:text-[var(--color-link)]">
        {pick.label}
      </p>
      {pick.subtitle ? (
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--ink-secondary)]">
          {pick.subtitle}
        </p>
      ) : null}
      <span className="mt-4 text-sm font-medium text-[var(--ink-muted)] group-hover:text-[var(--color-link)]">
        Open →
      </span>
    </Link>
  );
}

function EditorialGrid({ picks }: { picks: ExplorerEditorialPick[] }) {
  if (picks.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {picks.map((pick) => (
        <EditorialCard key={`${pick.href}-${pick.label}`} pick={pick} />
      ))}
    </div>
  );
}

export function ExplorerEditorialSections({ editorial }: ExplorerEditorialSectionsProps) {
  const { todaysLanguage, popularConstructions, nativeExpressions, grammarSpotlight } = editorial;

  return (
    <div className="space-y-12 pb-4">
      {todaysLanguage ? (
        <section>
          <p className="home-section-label">Today&apos;s language</p>
          <Link
            href={todaysLanguage.explorerHref}
            className="focus-kb group mt-4 block max-w-3xl"
          >
            <h2 className="break-russian font-reader text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] tracking-tight text-[var(--ink)] group-hover:text-[var(--color-link)]">
              {todaysLanguage.displayLabel}
            </h2>
            <p className="break-russian mt-3 font-reader text-lg italic text-[var(--ink-secondary)]">
              &ldquo;{todaysLanguage.subtitle}&rdquo;
            </p>
          </Link>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {discoveryMetadataLine(todaysLanguage)}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
            {todaysLanguage.explanation}
          </p>
          <p className="mt-4">
            <Link
              href={todaysLanguage.explorerHref}
              className="focus-kb text-sm font-medium text-[var(--ink)] underline-offset-2 hover:underline"
            >
              Open →
            </Link>
          </p>
        </section>
      ) : null}

      {popularConstructions.length > 0 ? (
        <section>
          <p className="home-section-label">Popular constructions</p>
          <EditorialGrid picks={popularConstructions} />
        </section>
      ) : null}

      {nativeExpressions.length > 0 ? (
        <section>
          <p className="home-section-label">Native expressions</p>
          <EditorialGrid picks={nativeExpressions} />
        </section>
      ) : null}

      {grammarSpotlight ? (
        <section>
          <p className="home-section-label">Grammar spotlight</p>
          <div className="mt-4 max-w-3xl space-y-4 rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] p-5">
            <p className="font-reader text-2xl text-[var(--ink)]">
              <Reference href={grammarSpotlight.focalHref}>{grammarSpotlight.focalLabel}</Reference>
            </p>
            <KnowledgeChain items={grammarSpotlight.chain} />
            {grammarSpotlight.note ? (
              <MarginNote kind="grammar">{grammarSpotlight.note}</MarginNote>
            ) : null}
            <p>
              <Link
                href={grammarSpotlight.focalHref}
                className="focus-kb text-sm font-medium text-[var(--ink)] underline-offset-2 hover:underline"
              >
                Open →
              </Link>
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
