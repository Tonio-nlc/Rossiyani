import { conceptPath, lemmaPath } from "@/components/explorer/explorer-routes";
import { isCaseConcept } from "@/features/explorer/entity/explorer-eligibility";
import { formatPosLabelFr } from "@/lib/explorer/lemma-display";
import {
  buildLemmaDefinitions,
  estimatedLevelFromLemma,
  explorerFrequencyLabel,
  mapTextOccurrences,
  observedInContexts,
  pickShortExamples,
  relatedCasesFromLemma,
  seenInLevelMaterial,
  type ExplorerLemmaDefinition,
  type ExplorerLemmaExample,
  type ExplorerMicroscopeData,
  type ExplorerRelatedWord,
  type ExplorerTextOccurrence,
} from "@/lib/explorer/explorer-ia";
import { firstSentence } from "@/features/explorer/entity/types";
import type { ExplorerEntityPageData } from "@/features/explorer/entity/types";
import type { LemmaKnowledge } from "@/types/knowledge-graph";

export type ExplorerWordPresentation = {
  label: string;
  transcription: string | null;
  partOfSpeechLabel: string;
  practiceHref: string;
  readHref: string | null;
  exploreHref: string;
  definitions: ExplorerLemmaDefinition[];
  examples: ExplorerLemmaExample[];
  foundInTexts: ExplorerTextOccurrence[];
  relatedWords: ExplorerRelatedWord[];
  microscope: ExplorerMicroscopeData;
};

function mapRelatedConcepts(knowledge: LemmaKnowledge) {
  return [...knowledge.concepts, ...knowledge.relatedConcepts]
    .filter((concept) => !isCaseConcept(concept.conceptKey, concept.category))
    .filter((concept, index, list) => {
      return list.findIndex((item) => item.conceptKey === concept.conceptKey) === index;
    })
    .slice(0, 6)
    .map((concept) => ({
      label: concept.title.replace(/\s+case$/i, "").trim(),
      href: conceptPath(concept.conceptKey),
    }));
}

export function presentationFromLemma(
  knowledge: LemmaKnowledge,
  links: {
    practiceHref: string;
    exploreHref: string;
    readExamplesHref: string | null;
  },
): ExplorerWordPresentation {
  const foundInTexts = mapTextOccurrences(knowledge.textsWithStats);
  const relatedConcepts = mapRelatedConcepts(knowledge);
  const relatedCases = relatedCasesFromLemma(knowledge);
  const estimatedLevel = estimatedLevelFromLemma(knowledge);

  return {
    label: knowledge.stressMarked ?? knowledge.lemma,
    transcription:
      knowledge.stressMarked && knowledge.stressMarked !== knowledge.lemma
        ? `[${knowledge.stressMarked}]`
        : null,
    partOfSpeechLabel: formatPosLabelFr(knowledge.partOfSpeech),
    practiceHref: links.practiceHref,
    readHref: links.readExamplesHref,
    exploreHref: links.exploreHref,
    definitions: buildLemmaDefinitions(knowledge),
    examples: pickShortExamples(knowledge.examples, 5),
    foundInTexts,
    relatedWords: knowledge.familyLemmas.slice(0, 6).map((family) => ({
      label: family.lemma,
      href: lemmaPath(family.lemma, family.partOfSpeech),
      hint: "Same word family",
    })),
    microscope: {
      facts: [
        { label: "Type", value: formatPosLabelFr(knowledge.partOfSpeech) },
        { label: "Frequency", value: explorerFrequencyLabel(knowledge.occurrenceCount) },
        {
          label: "In your material",
          value: estimatedLevel
            ? seenInLevelMaterial(estimatedLevel)
            : observedInContexts(knowledge.occurrenceCount),
        },
      ],
      relatedConcepts,
      relatedCases,
      linkedTexts: foundInTexts.slice(0, 6),
    },
  };
}

export function presentationFromEntity(
  data: ExplorerEntityPageData,
  links: { practiceHref: string; readExamplesHref?: string | null },
): ExplorerWordPresentation {
  const definitions: ExplorerLemmaDefinition[] = [];
  const primary = data.translation ?? firstSentence(data.description);

  if (primary) {
    definitions.push({
      meaning: primary,
      note: data.commonMistakes ?? data.usageNotes ?? null,
    });
  }

  const examples = pickShortExamples(
    data.examples.map((example, index) => ({
      id: `entity-${index}`,
      sentenceRussian: example.russian,
      naturalTranslation: example.translation ?? null,
      textId: example.textId ?? null,
      textTitle: example.textTitle ?? null,
    })),
    5,
  );

  const foundInTexts = data.relatedTexts
    .filter((text): text is typeof text & { textId: string } => Boolean(text.textId))
    .reduce<ExplorerTextOccurrence[]>((acc, text) => {
      const existing = acc.find((item) => item.textId === text.textId);
      if (existing) {
        existing.occurrenceCount += 1;
        return acc;
      }
      acc.push({
        textId: text.textId,
        textTitle: text.textTitle ?? "Text",
        occurrenceCount: 1,
        previewSnippet: text.russian ? text.russian.slice(0, 64) : null,
      });
      return acc;
    }, []);

  const relatedWords = data.continueExploring.slice(0, 6).map((item) => ({
    label: item.label,
    href: item.href,
  }));

  return {
    label: data.label,
    transcription: null,
    partOfSpeechLabel: data.typeLabel,
    practiceHref: links.practiceHref,
    readHref:
      links.readExamplesHref ??
      (data.relatedTexts[0]?.textId ? `/texts/${data.relatedTexts[0].textId}` : null),
    exploreHref: `/explorer?q=${encodeURIComponent(data.label)}`,
    definitions: definitions.slice(0, 3),
    examples,
    foundInTexts,
    relatedWords,
    microscope: {
      facts: [
        { label: "Type", value: data.typeLabel },
        { label: "Frequency", value: explorerFrequencyLabel(data.examples.length) },
        { label: "In your material", value: observedInContexts(data.examples.length) },
      ],
      relatedConcepts: data.relatedConcepts.slice(0, 6).map((item) => ({
        label: item.label,
        href: item.href,
      })),
      relatedCases: data.relatedGrammar.slice(0, 4).map((item) => ({
        label: item.label,
        href: item.href,
      })),
      linkedTexts: foundInTexts.slice(0, 6),
    },
  };
}
