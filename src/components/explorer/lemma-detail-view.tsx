import type { LemmaKnowledge } from "@/types/knowledge-graph";
import {
  tutorSimpleExplanationFromLemma,
  tutorWhyFromLemma,
} from "@/lib/explorer/tutor-copy";
import { practicePath } from "@/lib/practice/constants";

import { ExplorerLayout } from "./explorer-layout";
import {
  ExplorerTutorAction,
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
          }}
        />
      </article>
    </ExplorerLayout>
  );
}
