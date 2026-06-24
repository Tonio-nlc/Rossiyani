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

export type ExplorerGrammarSection = {
  id: "definition" | "morphology" | "explanation";
  title: string;
  rows: MicroscopeRow[];
  prose: string | null;
};

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
    sections: ExplorerGrammarSection[];
  };
  context: {
    sentenceRussian: string | null;
    sentenceMeaning: string | null;
    usage: string | null;
  };
};

const MORPHOLOGY_LABEL =
  /cas|genre|nombre|aspect|temps|conjugaison|terminaison|forme|animé|irrégulier|motion|reflexive|personne|mood|voix/i;
const DEFINITION_LABEL = /lemme|traduction|sens|meaning|définition|definition|fréquence/i;

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

function buildGrammarSections(
  view: ReaderMicroscopeView,
  detail: WordDetailGraph,
  snapshot: ReaderWordSnapshot,
): ExplorerGrammarSection[] {
  const rows = collectGrammarRows(view);
  const definition: MicroscopeRow[] = [];
  const morphology: MicroscopeRow[] = [];
  const explanationRows: MicroscopeRow[] = [];

  for (const row of rows) {
    const label = row.label.toLowerCase();
    if (DEFINITION_LABEL.test(label)) {
      definition.push(row);
    } else if (MORPHOLOGY_LABEL.test(label)) {
      morphology.push(row);
    } else {
      explanationRows.push(row);
    }
  }

  if (view.lemma && !definition.some((row) => /lemme|lemma/i.test(row.label))) {
    definition.unshift({ label: "Lemma", value: view.lemma });
  }

  const sectionNotes = view.sections
    .filter((section) =>
      ["verb", "noun", "adjective", "case", "ending", "generic"].includes(section.id),
    )
    .map((section) => section.note?.trim())
    .filter((note): note is string => Boolean(note));

  const prose =
    sectionNotes.join(" ") ||
    detail.canonicalExplanation?.trim() ||
    snapshot.explanation?.trim() ||
    null;

  const sections: ExplorerGrammarSection[] = [];

  if (definition.length > 0) {
    sections.push({ id: "definition", title: "Definition", rows: definition, prose: null });
  }

  if (morphology.length > 0) {
    sections.push({ id: "morphology", title: "Morphology", rows: morphology, prose: null });
  }

  if (prose || explanationRows.length > 0) {
    sections.push({
      id: "explanation",
      title: "Grammar explanation",
      rows: explanationRows,
      prose,
    });
  }

  return sections;
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
      sections: buildGrammarSections(view, detail, snapshot),
    },
    context: {
      sentenceRussian: snapshot.original,
      sentenceMeaning: snapshot.naturalTranslation || snapshot.literalTranslation || null,
      usage: detail.canonicalExplanation || snapshot.explanation || null,
    },
  };
}
