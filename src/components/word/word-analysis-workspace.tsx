"use client";

import { FrenchComparisonBlock } from "@/components/analysis/french-comparison-block";
import { MorphologyLadder } from "@/components/analysis/morphology-ladder";
import { WhyThisForm } from "@/components/analysis/why-this-form";
import {
  deriveFrenchComparison,
  formatCaseLabelFr,
  POS_LABELS_FR,
} from "@/features/grammar";
import { WORD_FREQUENCY_LABELS } from "@/types";
import type { PhraseGroupType, WordFrequency } from "@/types";
import { PHRASE_GROUP_TYPE_LABELS } from "@/types";

import type { NeighborWord, PhraseGroupPanelData, WordPanelData } from "./word-types";

export type { NeighborWord, PhraseGroupPanelData } from "./word-types";

type WordAnalysisWorkspaceProps = {
  word: WordPanelData | null;
  previousWord?: NeighborWord | null;
  phraseGroup: PhraseGroupPanelData;
};

function buildContextLabel(
  word: WordPanelData,
  previousWord?: NeighborWord | null,
): string | null {
  if (previousWord?.partOfSpeech === "preposition" && word.case) {
    const caseFr = formatCaseLabelFr(word.case);
    return caseFr ? `${previousWord.original} + ${caseFr}` : `${previousWord.original} + …`;
  }
  return null;
}

export function WordAnalysisWorkspace({
  word,
  previousWord,
  phraseGroup,
}: WordAnalysisWorkspaceProps) {
  if (!word) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-8 text-center">
        <p className="max-w-sm text-sm text-neutral-500">
          Cliquez sur un mot pour voir la décomposition (radical + terminaison), le cas, et
          pourquoi cette forme apparaît.
        </p>
      </div>
    );
  }

  const comparison = deriveFrenchComparison(
    {
      original: word.original,
      stressMarked: word.stressMarked,
      case: word.case,
      explanation: word.explanation,
      partOfSpeech: word.partOfSpeech,
    },
    previousWord,
  );

  const frequencyLabel = word.frequency
    ? WORD_FREQUENCY_LABELS[word.frequency as WordFrequency]
    : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-2">
        <MorphologyLadder
          lemma={word.lemma}
          stressMarked={word.stressMarked}
          stem={word.stem}
          ending={word.ending}
          partOfSpeech={word.partOfSpeech}
          grammaticalCase={word.case}
          gender={word.gender}
          number={word.number}
          contextLabel={buildContextLabel(word, previousWord)}
        />
        <div className="space-y-4">
          <WhyThisForm explanation={word.explanation} />
          <FrenchComparisonBlock comparison={comparison} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge label="Nature" value={POS_LABELS_FR[word.partOfSpeech]} />
        {frequencyLabel ? <Badge label="Fréquence" value={frequencyLabel} /> : null}
        {word.tense ? <Badge label="Temps" value={word.tense} /> : null}
        {word.aspect ? <Badge label="Aspect" value={word.aspect} /> : null}
      </div>

      {phraseGroup ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-neutral-500">Groupe de mots</p>
          <p className="mt-1 font-medium text-neutral-900">{phraseGroup.label}</p>
          <p className="text-xs text-neutral-500">
            {PHRASE_GROUP_TYPE_LABELS[phraseGroup.type as PhraseGroupType]}
          </p>
          <p className="mt-2 text-sm text-neutral-700">{phraseGroup.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-neutral-600">
      <span className="font-medium text-neutral-500">{label} :</span> {value}
    </span>
  );
}
