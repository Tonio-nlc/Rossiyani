import { conceptPath, lemmaPath } from "@/components/explorer/explorer-routes";
import { formatPosLabelFr } from "@/lib/explorer/lemma-display";
import {
  tutorSimpleExplanationFromEntity,
  tutorSimpleExplanationFromLemma,
  tutorWhyFromEntity,
  tutorWhyFromLemma,
} from "@/lib/explorer/tutor-copy";
import type { ExplorerEntityPageData } from "@/features/explorer/entity/types";
import { splitEditorialParagraphs } from "@/features/explorer/entity/types";
import type { LemmaKnowledge } from "@/types/knowledge-graph";
import type { GraphFormSummary } from "@/types/knowledge-graph";

export type ExplorerDefinition = {
  text: string;
  example?: {
    russian: string;
    translation?: string | null;
  };
};

export type ExplorerWordPresentation = {
  label: string;
  transcription: string | null;
  badges: string[];
  definitions: ExplorerDefinition[];
  etymology: string | null;
  usage: string | null;
  usageNote: string | null;
  imperfective: string | null;
  perfective: string | null;
  constructions: string[];
  forms: GraphFormSummary[];
  partOfSpeech: string;
  metadataLine?: string | null;
  heroSummary?: string | null;
  practiceHref: string;
  exploreHref: string;
  readExamplesHref: string | null;
  relatedLessons: ExplorerEntityPageData["relatedLessons"];
  relatedTexts: ExplorerEntityPageData["examples"];
  relatedConcepts: ExplorerEntityPageData["relatedConcepts"];
  relatedGrammar: ExplorerEntityPageData["relatedGrammar"];
  continueExploring: ExplorerEntityPageData["continueExploring"];
  extraExamples: ExplorerEntityPageData["examples"];
};

function extractBadgesFromLemma(knowledge: LemmaKnowledge): string[] {
  const badges: string[] = [formatPosLabelFr(knowledge.partOfSpeech)];
  if (knowledge.dominantAspect) {
    badges.push(knowledge.dominantAspect);
  }
  const comparison = knowledge.frenchComparison?.toLowerCase() ?? "";
  if (comparison.includes("intransitif")) {
    badges.push("Intransitif");
  } else if (comparison.includes("transitif")) {
    badges.push("Transitif");
  }
  return badges;
}

function buildAspectPair(knowledge: LemmaKnowledge): {
  imperfective: string | null;
  perfective: string | null;
} {
  const partner = knowledge.aspectPartner?.lemma ?? null;
  const isImpf = knowledge.dominantAspect === "Imperfectif";
  const isPerf = knowledge.dominantAspect === "Perfectif";

  if (isImpf) {
    return { imperfective: knowledge.lemma, perfective: partner };
  }
  if (isPerf) {
    return { imperfective: partner, perfective: knowledge.lemma };
  }
  return { imperfective: knowledge.lemma, perfective: partner };
}

function buildDefinitionsFromLemma(knowledge: LemmaKnowledge): ExplorerDefinition[] {
  const definitions: ExplorerDefinition[] = [];
  const primaryExample = knowledge.examples[0];

  if (knowledge.primaryTranslation) {
    definitions.push({
      text: knowledge.primaryTranslation,
      example: primaryExample
        ? {
            russian: primaryExample.sentenceRussian,
            translation: primaryExample.naturalTranslation,
          }
        : undefined,
    });
  }

  for (const meaning of knowledge.secondaryTranslations) {
    definitions.push({ text: meaning });
  }

  if (knowledge.simpleExplanation) {
    for (const paragraph of splitEditorialParagraphs(knowledge.simpleExplanation)) {
      if (!definitions.some((item) => item.text === paragraph)) {
        definitions.push({ text: paragraph });
      }
    }
  }

  if (definitions.length === 0 && knowledge.canonicalExplanation) {
    definitions.push({ text: knowledge.canonicalExplanation });
  }

  return definitions;
}

function buildEtymologyFromLemma(knowledge: LemmaKnowledge): string | null {
  const conceptExplanation =
    knowledge.concepts[0]?.canonicalExplanation ??
    knowledge.relatedConcepts[0]?.canonicalExplanation;
  if (conceptExplanation?.trim()) {
    return conceptExplanation.trim();
  }
  if (knowledge.canonicalExplanation && !knowledge.simpleExplanation) {
    return knowledge.canonicalExplanation;
  }
  return null;
}

export function presentationFromLemma(
  knowledge: LemmaKnowledge,
  links: {
    practiceHref: string;
    exploreHref: string;
    readExamplesHref: string | null;
  },
): ExplorerWordPresentation {
  const { imperfective, perfective } = buildAspectPair(knowledge);
  const usage = tutorSimpleExplanationFromLemma(knowledge);
  const why = tutorWhyFromLemma(knowledge);

  return {
    label: knowledge.stressMarked ?? knowledge.lemma,
    transcription: knowledge.stressMarked && knowledge.stressMarked !== knowledge.lemma
      ? `[${knowledge.stressMarked}]`
      : null,
    badges: extractBadgesFromLemma(knowledge),
    definitions: buildDefinitionsFromLemma(knowledge),
    etymology: buildEtymologyFromLemma(knowledge),
    usage: usage || why,
    usageNote: knowledge.frenchComparison?.trim() ?? null,
    imperfective,
    perfective,
    constructions: knowledge.phrases.map((phrase) => phrase.label).slice(0, 6),
    forms: knowledge.forms,
    partOfSpeech: knowledge.partOfSpeech,
    metadataLine: null,
    heroSummary: null,
    practiceHref: links.practiceHref,
    exploreHref: links.exploreHref,
    readExamplesHref: links.readExamplesHref,
    relatedLessons: knowledge.relatedLessons,
    relatedTexts: knowledge.examples.map((example) => ({
      russian: example.sentenceRussian,
      translation: example.naturalTranslation ?? undefined,
      textId: example.textId ?? undefined,
      textTitle: example.textTitle ?? undefined,
    })),
    relatedConcepts: [...knowledge.concepts, ...knowledge.relatedConcepts]
      .filter((concept, index, list) => {
        return list.findIndex((item) => item.conceptKey === concept.conceptKey) === index;
      })
      .map((concept) => ({
        label: concept.title,
        href: conceptPath(concept.conceptKey),
        meta: concept.category,
      })),
    relatedGrammar: [],
    continueExploring: knowledge.familyLemmas.map((family) => ({
      label: family.lemma,
      href: lemmaPath(family.lemma, family.partOfSpeech),
    })),
    extraExamples: knowledge.examples.slice(1).map((example) => ({
      russian: example.sentenceRussian,
      translation: example.naturalTranslation ?? undefined,
      textId: example.textId ?? undefined,
      textTitle: example.textTitle ?? undefined,
    })),
  };
}

export function presentationFromEntity(
  data: ExplorerEntityPageData,
  links: { practiceHref: string; readExamplesHref?: string | null },
): ExplorerWordPresentation {
  const definitions: ExplorerDefinition[] = [];
  const primary = data.translation ?? data.description;
  const primaryExample = data.examples[0];

  if (primary) {
    definitions.push({
      text: primary,
      example: primaryExample
        ? { russian: primaryExample.russian, translation: primaryExample.translation }
        : undefined,
    });
  }

  for (const paragraph of splitEditorialParagraphs(data.description)) {
    if (!definitions.some((item) => item.text === paragraph)) {
      definitions.push({ text: paragraph });
    }
  }

  return {
    label: data.label,
    transcription: null,
    badges: [data.typeLabel, ...data.badges.map((badge) => badge.label)],
    definitions,
    etymology: data.whyItMatters ?? null,
    usage: tutorSimpleExplanationFromEntity(data) || tutorWhyFromEntity(data),
    usageNote: data.commonMistakes ?? data.usageNotes ?? null,
    imperfective: null,
    perfective: null,
    constructions: data.examples.slice(0, 4).map((example) => example.russian),
    forms: [],
    partOfSpeech: data.typeLabel,
    metadataLine: data.metadataLine || null,
    heroSummary: data.heroSummary ?? null,
    practiceHref: links.practiceHref,
    exploreHref: `/explorer?q=${encodeURIComponent(data.label)}`,
    readExamplesHref:
      links.readExamplesHref ??
      (data.relatedTexts[0]?.textId ? `/texts/${data.relatedTexts[0].textId}` : null),
    relatedLessons: data.relatedLessons,
    relatedTexts: data.relatedTexts,
    relatedConcepts: data.relatedConcepts,
    relatedGrammar: data.relatedGrammar,
    continueExploring: data.continueExploring,
    extraExamples: data.examples.slice(1),
  };
}
