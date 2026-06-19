import type { ExplorerEditorialData } from "@/features/explorer/get-explorer-editorial";
import { discoveryMetadataLine } from "@/features/discovery/discovery-metadata";

import {
  EditorialCard,
  GhostButton,
  SectionHeader,
} from "@/components/design-system";
import { KnowledgeChain, MarginNote, Reference } from "@/components/editorial";

import { ExplorerEditorialGrid, ExplorerEditorialSection } from "./explorer-editorial-grid";
import { ExplorerRecentSection } from "./explorer-recent-section";
import { ExplorerSearchPanel } from "./explorer-search-panel";
import {
  EXPLORER_GRAMMAR_LINKS,
  EXPLORER_VOCABULARY_LINKS,
} from "./explorer-hub-links";

const INDEX_LINKS = [
  { label: "Lemmes", href: "/explorer/lemmas", description: "Entrées lexicales du graphe" },
  { label: "Concepts", href: "/explorer/concepts", description: "Motifs grammaticaux et constructions" },
  { label: "Cas", href: "/explorer/cases", description: "Les six cas (+ locatif)" },
  { label: "Terminaisons", href: "/explorer/endings", description: "Formes fléchies et paradigmes" },
  { label: "Collocations", href: "/explorer/collocations", description: "Cooccurrences fréquentes" },
  { label: "Expressions", href: "/explorer/expressions", description: "Tournures idiomatiques" },
] as const;

type ExplorerHubProps = {
  editorial: ExplorerEditorialData;
  isEmpty: boolean;
};

type ExplorerEditorialSectionsProps = {
  editorial: ExplorerEditorialData;
};

function ExplorerEditorialSections({ editorial }: ExplorerEditorialSectionsProps) {
  const { todaysLanguage, popularConstructions, nativeExpressions, grammarSpotlight } = editorial;

  return (
    <div className="space-y-0">
      {todaysLanguage ? (
        <ExplorerEditorialSection eyebrow="Langue du jour">
          <EditorialCard
            href={todaysLanguage.explorerHref}
            featured
            title={todaysLanguage.displayLabel}
            subtitle={`« ${todaysLanguage.subtitle} »`}
            meta={discoveryMetadataLine(todaysLanguage)}
            footer={
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                  {todaysLanguage.explanation}
                </p>
                <GhostButton href={todaysLanguage.explorerHref}>Explorer →</GhostButton>
              </div>
            }
          />
        </ExplorerEditorialSection>
      ) : null}

      {popularConstructions.length > 0 ? (
        <ExplorerEditorialSection eyebrow="Constructions" title="Constructions fréquentes">
          <ExplorerEditorialGrid
            items={popularConstructions.map((pick) => ({
              label: pick.label,
              href: pick.href,
              subtitle: pick.subtitle,
            }))}
          />
        </ExplorerEditorialSection>
      ) : null}

      {nativeExpressions.length > 0 ? (
        <ExplorerEditorialSection eyebrow="Expressions" title="Tournures natives">
          <ExplorerEditorialGrid
            items={nativeExpressions.map((pick) => ({
              label: pick.label,
              href: pick.href,
              subtitle: pick.subtitle,
            }))}
          />
        </ExplorerEditorialSection>
      ) : null}

      {grammarSpotlight ? (
        <ExplorerEditorialSection eyebrow="Grammaire" title="Point grammatical">
          <div className="max-w-2xl space-y-4">
            <p className="font-reader text-2xl text-[var(--ink)]">
              <Reference href={grammarSpotlight.focalHref}>
                {grammarSpotlight.focalLabel}
              </Reference>
            </p>
            <KnowledgeChain items={grammarSpotlight.chain} />
            {grammarSpotlight.note ? (
              <MarginNote kind="grammar">{grammarSpotlight.note}</MarginNote>
            ) : null}
            <GhostButton href={grammarSpotlight.focalHref}>Explorer →</GhostButton>
          </div>
        </ExplorerEditorialSection>
      ) : null}
    </div>
  );
}

function ExplorerReferenceIndex() {
  return (
    <ExplorerEditorialSection eyebrow="Index" title="Parcourir le graphe">
      <ExplorerEditorialGrid
        items={INDEX_LINKS.map((link) => ({
          label: link.label,
          href: link.href,
          subtitle: link.description,
        }))}
      />
    </ExplorerEditorialSection>
  );
}

function ExplorerTopicLinks({
  eyebrow,
  title,
  links,
}: {
  eyebrow: string;
  title: string;
  links: Array<{ label: string; href: string; description?: string }>;
}) {
  return (
    <ExplorerEditorialSection eyebrow={eyebrow} title={title}>
      <ExplorerEditorialGrid
        items={links.map((link) => ({
          label: link.label,
          href: link.href,
          subtitle: link.description,
        }))}
      />
    </ExplorerEditorialSection>
  );
}

export function ExplorerHub({ editorial, isEmpty }: ExplorerHubProps) {
  return (
    <div className="pb-8">
      <header className="editorial-page-section pb-0">
        <SectionHeader
          eyebrow="Explorer"
          title="Référence linguistique"
          description="Découvrir le russe par les connexions — lemmes, constructions, cas et expressions issues de vos textes."
        />
      </header>

      <ExplorerSearchPanel autoFocus={!isEmpty} />

      <ExplorerReferenceIndex />

      <ExplorerTopicLinks
        eyebrow="Grammaire"
        title="Thèmes grammaticaux"
        links={EXPLORER_GRAMMAR_LINKS}
      />

      <ExplorerTopicLinks
        eyebrow="Vocabulaire"
        title="Champs lexicaux"
        links={EXPLORER_VOCABULARY_LINKS}
      />

      {isEmpty ? (
        <section className="editorial-page-section">
          <p className="text-metadata text-[var(--ink-muted)]">
            Le graphe est encore vide.{" "}
            <Reference href="/import">Importer un texte</Reference> pour commencer
            l&apos;exploration.
          </p>
        </section>
      ) : (
        <>
          <ExplorerEditorialSection eyebrow="Récent" title="Continuer l'exploration">
            <ExplorerRecentSection />
          </ExplorerEditorialSection>

          <ExplorerEditorialSections editorial={editorial} />
        </>
      )}
    </div>
  );
}
