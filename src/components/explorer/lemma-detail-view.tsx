import type { LemmaKnowledge } from "@/types/knowledge-graph";
import { practicePath } from "@/lib/practice/constants";

import { ExplorerMicroscopePanel } from "./explorer-microscope-panel";
import { ExplorerStudyShell } from "./explorer-study-shell";
import { ExplorerStudySidebar } from "./explorer-study-sidebar";
import { ExplorerWordMain } from "./explorer-word-main";
import { presentationFromLemma } from "./explorer-word-presentation";

type LemmaDetailViewProps = {
  knowledge: LemmaKnowledge;
};

export function LemmaDetailView({ knowledge }: LemmaDetailViewProps) {
  const readExamplesHref = knowledge.examples[0]?.textId
    ? `/texts/${knowledge.examples[0].textId}`
    : null;
  const presentation = presentationFromLemma(knowledge, {
    practiceHref: practicePath({
      structure: knowledge.lemma,
      mode: "structure",
      from: "explorer",
    }),
    exploreHref: `/explorer?q=${encodeURIComponent(knowledge.lemma)}`,
    readExamplesHref,
  });

  return (
    <ExplorerStudyShell
      sidebar={<ExplorerStudySidebar showWordNav />}
      main={
        <ExplorerWordMain
          presentation={presentation}
          breadcrumb={[{ label: "Explorer", href: "/explorer" }, { label: knowledge.lemma }]}
        />
      }
      microscope={<ExplorerMicroscopePanel presentation={presentation} />}
    />
  );
}
