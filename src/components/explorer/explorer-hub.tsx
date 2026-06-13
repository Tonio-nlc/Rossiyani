import Link from "next/link";

import type { ExplorerIndexTopic, KnowledgeCanvasData } from "@/features/explorer";
import type { HomeDailyConnection } from "@/features/home";

import {
  Chapter,
  EditorialTitle,
  Hairline,
  IndexList,
  KnowledgeChain,
  MarginNote,
  Reference,
  Section,
} from "@/components/editorial";

import { ExplorerKnowledgeCanvas } from "./explorer-knowledge-canvas";
import { ExplorerRecentSection } from "./explorer-recent-section";
import { ExplorerSearchPanel } from "./explorer-search-panel";

type ExplorerHubProps = {
  indexTopics: ExplorerIndexTopic[];
  canvas: KnowledgeCanvasData | null;
  dailyConnection: HomeDailyConnection | null;
  textCount: number;
  isEmpty: boolean;
};

export function ExplorerHub({
  indexTopics,
  canvas,
  dailyConnection,
  textCount,
  isEmpty,
}: ExplorerHubProps) {
  return (
    <Chapter wide>
      <header className="pb-[var(--space-4)]">
        <EditorialTitle variant="page">Explorer</EditorialTitle>
        <p className="editorial-intro mt-[var(--space-2)]">
          Parcourir la langue par associations — pas par filtres.
        </p>
      </header>

      <ExplorerSearchPanel autoFocus={!isEmpty} />

      <Hairline className="my-[var(--space-5)]" />

      {isEmpty ? (
        <Section eyebrow="Index">
          <p className="text-metadata text-[var(--ink-muted)]">
            Le graphe est encore vide.{" "}
            <Reference href="/import">Importer un texte</Reference> pour commencer l&apos;exploration.
          </p>
        </Section>
      ) : (
        <>
          <Section eyebrow="Editorial Index" className="!py-[var(--space-5)]">
            {indexTopics.length > 0 ? (
              <ul className="divide-y divide-[var(--hairline)]">
                {indexTopics.map((topic) => (
                  <li key={topic.label}>
                    <Link
                      href={topic.href}
                      className="focus-kb group flex items-baseline justify-between gap-6 py-3"
                    >
                      <span className="font-reader text-lg text-[var(--ink)] group-hover:text-[var(--color-link)]">
                        {topic.label}
                      </span>
                      <span className="text-metadata shrink-0 text-[var(--ink-muted)]">
                        {topic.count} {topic.unit} →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>

          {canvas ? (
            <>
              <Hairline />
              <Section eyebrow="Knowledge Canvas" className="!py-[var(--space-5)]">
                <ExplorerKnowledgeCanvas canvas={canvas} />
              </Section>
            </>
          ) : null}

          {dailyConnection ? (
            <>
              <Hairline />
              <Section eyebrow="Today's Connection" className="!py-[var(--space-5)]">
                <KnowledgeChain items={dailyConnection.chain} />
                {dailyConnection.note ? (
                  <MarginNote kind="usage" className="mt-[var(--space-4)]">
                    {dailyConnection.note}
                  </MarginNote>
                ) : null}
                {dailyConnection.relatedText ? (
                  <p className="mt-[var(--space-3)] text-metadata">
                    Related text —{" "}
                    <Reference href={dailyConnection.relatedText.href}>
                      {dailyConnection.relatedText.label}
                    </Reference>
                  </p>
                ) : null}
              </Section>
            </>
          ) : null}

          <Hairline />

          <Section eyebrow="Recently Explored" className="!py-[var(--space-5)]">
            <ExplorerRecentSection />
          </Section>

          <Hairline />

          <Section eyebrow="Collections" className="!py-[var(--space-5)]">
            <IndexList
              items={[
                { label: "Concepts", href: "/explorer/concepts", meta: "Grammaire & sens" },
                { label: "Lemmes", href: "/explorer/lemmas", meta: "Vocabulaire" },
                { label: "Cas", href: "/explorer/cases", meta: "Morphologie" },
                { label: "Terminaisons", href: "/explorer/endings", meta: "Flexions" },
                { label: "Collocations", href: "/explorer/collocations", meta: "Cooccurrences" },
                { label: "Expressions", href: "/explorer/expressions", meta: "Figées" },
                { label: "Textes", href: "/library", meta: `${textCount} importés` },
              ]}
            />
          </Section>
        </>
      )}
    </Chapter>
  );
}
