import path from "node:path";

import { describe, expect, it, beforeAll } from "vitest";

import type { SentenceAnalysisOutput, WordAnalysisOutput } from "@/services/ai/schemas";
import { PatternCatalogService } from "@/services/patterns";
import { indexPatternInstances, selectPrimaryPattern } from "@/services/patterns/indexer";
import { detectPatternsInSentence } from "@/services/patterns/indexer/detect-patterns";

const CATALOG_ROOT = path.join(process.cwd(), "data", "patterns");

function baseSentence(overrides: Partial<SentenceAnalysisOutput>): SentenceAnalysisOutput {
  return {
    russianText: overrides.russianText ?? "Тест.",
    literalTranslation: overrides.literalTranslation ?? "Test.",
    naturalTranslation: overrides.naturalTranslation ?? "Test.",
    russianLogic: overrides.russianLogic ?? "Test.",
    orderExplanation: overrides.orderExplanation ?? "Test.",
    nativeUsageNotes: overrides.nativeUsageNotes ?? "",
    register: "neutral",
    difficultyScore: 2,
    words: overrides.words ?? [],
    phraseGroups: overrides.phraseGroups ?? [],
    culturalNotes: [],
    analysisStatus: "complete",
  };
}

function word(
  position: number,
  original: string,
  lemma: string,
  fields: Partial<WordAnalysisOutput> = {},
): WordAnalysisOutput {
  return {
    position,
    original,
    lemma,
    stressMarked: original,
    stem: original,
    ending: "",
    partOfSpeech: "noun",
    explanation: "explication",
    translationCanonical: original,
    ...fields,
  };
}

describe("pattern instance indexer", () => {
  let catalog: PatternCatalogService;

  beforeAll(async () => {
    catalog = await PatternCatalogService.loadFromDirectory(CATALOG_ROOT);
  });

  it("detects a single pattern in a simple pro-drop sentence", () => {
    const analysis = baseSentence({
      russianText: "Пойдём в кино?",
      words: [
        word(0, "Пойдём", "пойти", { partOfSpeech: "verb", tense: "present" }),
        word(1, "в", "в", { partOfSpeech: "preposition" }),
        word(2, "кино", "кино", { partOfSpeech: "noun", case: "accusative" }),
      ],
    });

    const index = indexPatternInstances({
      sentenceId: "sentence-zero",
      textId: "text-dialogues",
      analysis,
      catalog,
    });

    expect(index.instances.length).toBeGreaterThanOrEqual(1);
    expect(index.primaryPatternId).toBe("lp.syntax.zero_subject.v1");
    expect(index.instances.find((instance) => instance.isPrimary)?.patternId).toBe(
      "lp.syntax.zero_subject.v1",
    );
    expect(index.secondaryPatternIds).not.toContain("lp.syntax.zero_subject.v1");
  });

  it("detects multiple patterns and keeps secondaries", () => {
    const analysis = baseSentence({
      russianText: "У моей сестры есть кот.",
      words: [
        word(0, "У", "у", { partOfSpeech: "preposition" }),
        word(1, "моей", "мой", { partOfSpeech: "adjective", case: "genitive", ending: "ей" }),
        word(2, "сестры", "сестра", { partOfSpeech: "noun", case: "genitive", ending: "ы" }),
        word(3, "есть", "есть", { partOfSpeech: "verb", tense: "present" }),
        word(4, "кот", "кот", { partOfSpeech: "noun", case: "nominative" }),
      ],
    });

    const index = indexPatternInstances({
      sentenceId: "sentence-possession",
      textId: "text-a1-family-01",
      analysis,
      catalog,
    });

    const patternIds = index.instances.map((instance) => instance.patternId);
    expect(patternIds).toContain("lp.syntax.possession_existence.v1");
    expect(patternIds).toContain("lp.morphology.role_terminations.v1");
    expect(index.primaryPatternId).not.toBeNull();
    expect(index.secondaryPatternIds.length).toBeGreaterThanOrEqual(1);
    expect(index.instances.filter((instance) => instance.isPrimary)).toHaveLength(1);
  });

  it("prioritizes editorial introduction for primary selection", () => {
    const analysis = baseSentence({
      russianText: "У моей сестры есть кот.",
      words: [
        word(0, "У", "у", { partOfSpeech: "preposition" }),
        word(1, "моей", "мой", { partOfSpeech: "adjective", case: "genitive", ending: "ей" }),
        word(2, "сестры", "сестра", { partOfSpeech: "noun", case: "genitive", ending: "ы" }),
        word(3, "есть", "есть", { partOfSpeech: "verb", tense: "present" }),
        word(4, "кот", "кот", { partOfSpeech: "noun", case: "nominative" }),
      ],
    });

    const candidates = detectPatternsInSentence(catalog.getPatterns({ status: "canonical" }), {
      analysis,
      conceptKeys: ["genitive_case", "u_genitive_possession", "existence_construction"],
    });

    const { primary, reasons } = selectPrimaryPattern(candidates, catalog, {
      textId: "text-a1-family-01",
      editorialIntroPatternIds: ["lp.morphology.role_terminations.v1"],
    });

    expect(primary?.patternId).toBe("lp.morphology.role_terminations.v1");
    expect(reasons.some((reason) => reason.code === "editorial_introduction")).toBe(true);
  });

  it("returns no patterns for a sentence without matching signals", () => {
    const analysis = baseSentence({
      russianText: "Привет.",
      words: [word(0, "Привет", "привет", { partOfSpeech: "interjection" })],
    });

    const index = indexPatternInstances({
      sentenceId: "sentence-empty",
      textId: "text-none",
      analysis,
      catalog,
    });

    expect(index.instances).toHaveLength(0);
    expect(index.primaryPatternId).toBeNull();
    expect(index.secondaryPatternIds).toHaveLength(0);
  });

  it("detects dative recipient as primary on transfer verb sentences", () => {
    const analysis = baseSentence({
      russianText: "Я дал книгу сестре.",
      words: [
        word(0, "Я", "я", { partOfSpeech: "pronoun", case: "nominative" }),
        word(1, "дал", "дать", { partOfSpeech: "verb", tense: "past" }),
        word(2, "книгу", "книга", { partOfSpeech: "noun", case: "accusative" }),
        word(3, "сестре", "сестра", { partOfSpeech: "noun", case: "dative", ending: "е" }),
      ],
    });

    const index = indexPatternInstances({
      sentenceId: "sentence-dative",
      textId: "text-stories",
      analysis,
      catalog,
    });

    expect(index.instances.map((instance) => instance.patternId)).toContain(
      "lp.morphology.dative_recipient.v1",
    );
    expect(index.primaryPatternId).toBe("lp.morphology.dative_recipient.v1");
    const primary = index.instances.find((instance) => instance.isPrimary);
    expect(primary?.triggeringTokens.length).toBeGreaterThan(0);
    expect(primary?.evidence.length).toBeGreaterThan(0);
    expect(primary?.confidence).toBeGreaterThan(0.5);
  });

  it("stores evidence and introduction level on each instance", () => {
    const analysis = baseSentence({
      russianText: "Я помогаю маме.",
      words: [
        word(0, "Я", "я", { partOfSpeech: "pronoun" }),
        word(1, "помогаю", "помогать", { partOfSpeech: "verb", tense: "present" }),
        word(2, "маме", "мама", { partOfSpeech: "noun", case: "dative", ending: "е" }),
      ],
    });

    const index = indexPatternInstances({
      sentenceId: "sentence-valency",
      textId: "text-everyday",
      analysis,
      catalog,
    });

    const valency = index.instances.find(
      (instance) => instance.patternId === "lp.verbs.preferred_constructions.v1",
    );
    expect(valency).toBeDefined();
    expect(valency?.introductionLevel).toBe("L2");
    expect(valency?.evidence.some((entry) => entry.source === "detection_rule")).toBe(true);
    expect(valency?.isPrimary).toBe(true);
  });

  it("resolves aspect pair intuition on perfective/imperfective contrast", () => {
    const analysis = baseSentence({
      russianText: "Он писал письмо, потом написал.",
      words: [
        word(0, "Он", "он", { partOfSpeech: "pronoun" }),
        word(1, "писал", "писать", {
          partOfSpeech: "verb",
          tense: "past",
          aspect: "imperfective",
        }),
        word(2, "письмо", "письмо", { partOfSpeech: "noun", case: "accusative" }),
        word(3, "потом", "потом", { partOfSpeech: "adverb" }),
        word(4, "написал", "написать", {
          partOfSpeech: "verb",
          tense: "past",
          aspect: "perfective",
        }),
      ],
    });

    const index = indexPatternInstances({
      sentenceId: "sentence-aspect",
      textId: "text-stories",
      analysis,
      catalog,
    });

    expect(index.instances.map((instance) => instance.patternId)).toContain(
      "lp.aspect.pair_intuition.v1",
    );
  });
});
