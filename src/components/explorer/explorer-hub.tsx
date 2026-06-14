import type { ExplorerEditorialData } from "@/features/explorer/get-explorer-editorial";

import { Chapter, EditorialTitle, Reference, Section } from "@/components/editorial";

import { ExplorerEditorialSections } from "./explorer-editorial-sections";
import { ExplorerRecentSection } from "./explorer-recent-section";
import { ExplorerSearchPanel } from "./explorer-search-panel";

type ExplorerHubProps = {
  editorial: ExplorerEditorialData;
  isEmpty: boolean;
};

export function ExplorerHub({ editorial, isEmpty }: ExplorerHubProps) {
  return (
    <Chapter wide>
      <header className="pb-[var(--space-4)]">
        <EditorialTitle variant="page">Explorer</EditorialTitle>
        <p className="editorial-intro mt-[var(--space-2)]">
          Discover Russian through connections — not categories.
        </p>
      </header>

      <ExplorerSearchPanel autoFocus={!isEmpty} />

      {isEmpty ? (
        <Section eyebrow="Explorer" className="mt-[var(--space-5)]">
          <p className="text-metadata text-[var(--ink-muted)]">
            The graph is still empty.{" "}
            <Reference href="/import">Import a text</Reference> to start exploring.
          </p>
        </Section>
      ) : (
        <div className="mt-[var(--space-6)] space-y-12">
          <section>
            <p className="home-section-label">Continue exploring</p>
            <div className="mt-4">
              <ExplorerRecentSection />
            </div>
          </section>

          <ExplorerEditorialSections editorial={editorial} />
        </div>
      )}
    </Chapter>
  );
}
