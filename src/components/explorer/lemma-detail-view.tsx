import type { LemmaKnowledge } from "@/types/knowledge-graph";
import {
  tutorSimpleExplanationFromLemma,
  tutorWhyFromLemma,
} from "@/lib/explorer/tutor-copy";
import { practicePath } from "@/lib/practice/constants";

import { GhostButton } from "@/components/design-system";

import { ExplorerLayout } from "./explorer-layout";
import {
  ExplorerTutorExample,
  ExplorerTutorExplanation,
  ExplorerTutorTitle,
  ExplorerTutorWhy,
} from "./explorer-tutor-sections";

type LemmaDetailViewProps = {
  knowledge: LemmaKnowledge;
};

export function LemmaDetailView({ knowledge }: LemmaDetailViewProps) {
  const primaryExample = knowledge.examples[0];
  const practiceHref = practicePath({
    structure: knowledge.lemma,
    mode: "structure",
    from: "explorer",
  });
  const exploreHref = `/explorer?q=${encodeURIComponent(knowledge.lemma)}`;

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

        <div className="editorial-page-section pb-0">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <GhostButton href="#exemple">Comprendre →</GhostButton>
            </li>
            <li>
              <GhostButton href={exploreHref}>Explorer →</GhostButton>
            </li>
            <li>
              <GhostButton href={practiceHref}>Pratiquer →</GhostButton>
            </li>
          </ul>
        </div>

        {primaryExample ? (
          <div id="exemple">
            <ExplorerTutorExample
              russian={primaryExample.sentenceRussian}
              translation={primaryExample.naturalTranslation}
            />
          </div>
        ) : null}

        <div id="usage">
          <ExplorerTutorExplanation text={tutorSimpleExplanationFromLemma(knowledge)} />
        </div>
      </article>
    </ExplorerLayout>
  );
}
