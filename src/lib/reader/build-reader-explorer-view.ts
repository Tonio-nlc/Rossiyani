import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import {
  buildReaderMicroscopeView,
  type MicroscopeRow,
  type ReaderMicroscopeView,
} from "@/lib/reader/build-reader-microscope-view";
import type { ReaderTextPhraseIndex } from "@/lib/reader/build-reader-word-panel-data";
import { formatCaseLabelFr } from "@/features/grammar";
import { resolveWordSemanticData } from "@/lib/formatting/resolve-word-semantic-data";
import {
  formatAspectFr,
  formatGenderFr,
  formatNumberFr,
} from "@/lib/formatting/word-morphology-display";
import type { WordDetailGraph } from "@/types/word-detail-graph";

export type ReaderExplorerTab = "dictionary" | "grammar" | "context";

export type ReaderExplorerView = {
  headline: string;
  lemma: string | null;
  transliteration: string | null;
  partOfSpeech: string | null;
  dictionary: {
    translation: string | null;
    meanings: string[];
    examples: string[];
  };
  grammar: {
    tags: string[];
    rows: MicroscopeRow[];
  };
  context: {
    sentenceRussian: string | null;
    sentenceMeaning: string | null;
    usage: string | null;
  };
};

function collectGrammarRows(view: ReaderMicroscopeView): MicroscopeRow[] {
  const grammarSectionIds = new Set([
    "verb",
    "noun",
    "adjective",
    "case",
    "ending",
    "generic",
    "collocation",
    "expression",
  ]);

  return view.sections
    .filter((section) => grammarSectionIds.has(section.id))
    .flatMap((section) => section.rows);
}

function collectExamples(view: ReaderMicroscopeView): string[] {
  return view.sections
    .flatMap((section) => section.rows)
    .filter((row) => /exemple|example|usage/i.test(row.label))
    .map((row) => row.value)
    .slice(0, 4);
}

export function buildReaderExplorerView(input: {
  detail: WordDetailGraph | null;
  snapshot: ReaderWordSnapshot | null;
  textIndex: ReaderTextPhraseIndex;
}): ReaderExplorerView | null {
  const { detail, snapshot, textIndex } = input;
  if (!detail || !snapshot) {
    return null;
  }

  const view = buildReaderMicroscopeView(detail, textIndex);
  const semantic = resolveWordSemanticData(detail);
  const meanings =
    semantic.primaryMeanings.length > 0
      ? semantic.primaryMeanings
      : view.translation
        ? [view.translation]
        : [];

  const tags: string[] = [];
  if (view.metadataLine) {
    tags.push(view.metadataLine);
  }
  if (snapshot.partOfSpeech) {
    tags.push(snapshot.partOfSpeech);
  }
  const caseLabel = formatCaseLabelFr(snapshot.case);
  if (caseLabel) {
    tags.push(caseLabel);
  }
  const genderLabel = formatGenderFr(snapshot.gender);
  if (genderLabel) {
    tags.push(genderLabel);
  }
  const numberLabel = formatNumberFr(snapshot.number);
  if (numberLabel) {
    tags.push(numberLabel);
  }
  const aspectLabel = formatAspectFr(snapshot.aspect);
  if (aspectLabel) {
    tags.push(aspectLabel);
  }

  return {
    headline: view.headline,
    lemma: view.lemma,
    transliteration: snapshot.stressMarked || snapshot.original,
    partOfSpeech: snapshot.partOfSpeech,
    dictionary: {
      translation: view.translation,
      meanings,
      examples: collectExamples(view),
    },
    grammar: {
      tags: [...new Set(tags.filter(Boolean))],
      rows: collectGrammarRows(view),
    },
    context: {
      sentenceRussian: snapshot.original,
      sentenceMeaning: snapshot.naturalTranslation || snapshot.literalTranslation || null,
      usage: detail.canonicalExplanation || snapshot.explanation || null,
    },
  };
}
