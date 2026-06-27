import { LOCAL_DICTIONARY_GLOSS } from "@/lib/formatting/estimate-word-translation";
import type { PartOfSpeech } from "@/types/domain";
import type { WordDetailGraph } from "@/types/word-detail-graph";

import { stubLemmaEntity } from "../helpers/lemma-entity-stub";
import { stubLemmaKnowledge } from "../helpers/lemma-knowledge-stub";

export function buildWordDetail(overrides: Partial<WordDetailGraph> = {}): WordDetailGraph {
  const base: WordDetailGraph = {
    wordId: "w1",
    textId: "t1",
    sentenceId: "s1",
    occurrence: {
      original: "слово",
      stressMarked: "сло́во",
      lemma: "слово",
      partOfSpeech: "noun",
      stem: "слов",
      ending: "о",
      case: null,
      gender: null,
      number: null,
      tense: null,
      aspect: null,
      explanation: "",
      frequency: null,
      translationCanonical: null,
      translationAlternatives: [],
    },
    contextLabel: null,
    canonicalExplanation: "",
    grammaticalReason: "",
    frenchComparison: null,
    frenchComparisonCanonical: null,
    literalTranslation: null,
    naturalTranslation: null,
    domain: {
      form: null,
      lemma: null,
      ending: null,
      case: null,
      concepts: [],
      expression: null,
      collocation: null,
    },
    lemmaKnowledge: null,
    endingKnowledge: null,
    phraseKnowledge: null,
    phraseOccurrence: null,
    concepts: [],
    relatedTexts: [],
    examples: [],
    statistics: {
      occurrenceCount: 0,
      seenInTexts: 0,
      libraryHitCount: null,
      collocationCount: null,
    },
    loadedSections: ["basic"],
  };

  return {
    ...base,
    ...overrides,
    occurrence: { ...base.occurrence, ...overrides.occurrence },
    domain: { ...base.domain, ...overrides.domain },
  };
}

export type SemanticFixture = {
  id: string;
  original: string;
  lemma: string;
  partOfSpeech: PartOfSpeech;
  expectedTranslation: string;
  translationSource: "KnowledgeLemma" | "dictionary" | "none";
  lemmaFrenchComparison?: string;
  explanation?: string;
  canonicalExplanation?: string;
  frenchComparisonCanonical?: string | null;
};

/** 100+ words — explicit lexical expectations under strict resolution rules. */
export const SEMANTIC_FIXTURES: SemanticFixture[] = [
  // nouns
  { id: "n1", original: "яблони", lemma: "яблоня", partOfSpeech: "noun", expectedTranslation: "pommier", translationSource: "dictionary" },
  { id: "n2", original: "груши", lemma: "груша", partOfSpeech: "noun", expectedTranslation: "poire", translationSource: "dictionary" },
  { id: "n3", original: "деревьях", lemma: "дерево", partOfSpeech: "noun", expectedTranslation: "arbres", translationSource: "dictionary" },
  { id: "n4", original: "городке", lemma: "городок", partOfSpeech: "noun", expectedTranslation: "petite ville", translationSource: "dictionary" },
  { id: "n5", original: "зима", lemma: "зима", partOfSpeech: "noun", expectedTranslation: "hiver", translationSource: "dictionary" },
  { id: "n6", original: "лето", lemma: "лето", partOfSpeech: "noun", expectedTranslation: "été", translationSource: "dictionary" },
  { id: "n7", original: "весна", lemma: "весна", partOfSpeech: "noun", expectedTranslation: "printemps", translationSource: "dictionary" },
  { id: "n8", original: "осень", lemma: "осень", partOfSpeech: "noun", expectedTranslation: "automne", translationSource: "dictionary" },
  { id: "n9", original: "дом", lemma: "дом", partOfSpeech: "noun", expectedTranslation: "maison", translationSource: "dictionary" },
  { id: "n10", original: "вода", lemma: "вода", partOfSpeech: "noun", expectedTranslation: "eau", translationSource: "dictionary" },
  { id: "n11", original: "день", lemma: "день", partOfSpeech: "noun", expectedTranslation: "jour", translationSource: "dictionary" },
  { id: "n12", original: "ночь", lemma: "ночь", partOfSpeech: "noun", expectedTranslation: "nuit", translationSource: "dictionary" },
  { id: "n13", original: "человек", lemma: "человек", partOfSpeech: "noun", expectedTranslation: "personne", translationSource: "dictionary" },
  { id: "n14", original: "время", lemma: "время", partOfSpeech: "noun", expectedTranslation: "temps", translationSource: "dictionary" },
  { id: "n15", original: "жизнь", lemma: "жизнь", partOfSpeech: "noun", expectedTranslation: "vie", translationSource: "dictionary" },
  { id: "n16", original: "мир", lemma: "мир", partOfSpeech: "noun", expectedTranslation: "monde / paix", translationSource: "dictionary" },
  { id: "n17", original: "будни", lemma: "будни", partOfSpeech: "noun", expectedTranslation: "jours ouvrables", translationSource: "dictionary" },
  { id: "n18", original: "дыма", lemma: "дым", partOfSpeech: "noun", expectedTranslation: "fumée", translationSource: "dictionary", explanation: 'Nom signifiant "fumée", utilisé ici pour décrire un reste intangible.' },
  {
    id: "n19",
    original: "стол",
    lemma: "стол",
    partOfSpeech: "noun",
    expectedTranslation: "table",
    translationSource: "KnowledgeLemma",
    lemmaFrenchComparison: "table",
  },
  {
    id: "n20",
    original: "книги",
    lemma: "книга",
    partOfSpeech: "noun",
    expectedTranslation: "livre",
    translationSource: "KnowledgeLemma",
    lemmaFrenchComparison: "livre",
  },
  // verbs
  { id: "v1", original: "расцветали", lemma: "расцветать", partOfSpeech: "verb", expectedTranslation: "fleurir", translationSource: "dictionary" },
  { id: "v2", original: "начинает", lemma: "начинать", partOfSpeech: "verb", expectedTranslation: "commence", translationSource: "dictionary" },
  { id: "v3", original: "получится", lemma: "получиться", partOfSpeech: "verb", expectedTranslation: "réussir", translationSource: "dictionary" },
  { id: "v4", original: "есть", lemma: "быть", partOfSpeech: "verb", expectedTranslation: "il y a", translationSource: "dictionary" },
  {
    id: "v5",
    original: "читаю",
    lemma: "читать",
    partOfSpeech: "verb",
    expectedTranslation: "lire",
    translationSource: "KnowledgeLemma",
    lemmaFrenchComparison: "lire",
  },
  {
    id: "v6",
    original: "работает",
    lemma: "работать",
    partOfSpeech: "verb",
    expectedTranslation: "travailler",
    translationSource: "KnowledgeLemma",
    lemmaFrenchComparison: "travailler",
  },
  // adjectives
  { id: "a1", original: "морозная", lemma: "морозный", partOfSpeech: "adjective", expectedTranslation: "glaciale", translationSource: "dictionary" },
  { id: "a2", original: "больных", lemma: "больной", partOfSpeech: "adjective", expectedTranslation: "malade", translationSource: "dictionary" },
  { id: "a3", original: "обычные", lemma: "обычный", partOfSpeech: "adjective", expectedTranslation: "habituel / ordinaire", translationSource: "dictionary" },
  { id: "a4", original: "иного", lemma: "иной", partOfSpeech: "adjective", expectedTranslation: "autre", translationSource: "dictionary" },
  { id: "a5", original: "большой", lemma: "большой", partOfSpeech: "adjective", expectedTranslation: "grand", translationSource: "dictionary" },
  { id: "a6", original: "маленький", lemma: "маленький", partOfSpeech: "adjective", expectedTranslation: "petit", translationSource: "dictionary" },
  { id: "a7", original: "новый", lemma: "новый", partOfSpeech: "adjective", expectedTranslation: "nouveau", translationSource: "dictionary" },
  { id: "a8", original: "старый", lemma: "старый", partOfSpeech: "adjective", expectedTranslation: "vieux", translationSource: "dictionary" },
  { id: "a9", original: "хороший", lemma: "хороший", partOfSpeech: "adjective", expectedTranslation: "bon", translationSource: "dictionary" },
  { id: "a10", original: "русский", lemma: "русский", partOfSpeech: "adjective", expectedTranslation: "russe", translationSource: "dictionary" },
  {
    id: "a11",
    original: "красивую",
    lemma: "красивый",
    partOfSpeech: "adjective",
    expectedTranslation: "beau",
    translationSource: "KnowledgeLemma",
    lemmaFrenchComparison: "beau",
  },
  // adverbs
  { id: "adv1", original: "правильно", lemma: "правильно", partOfSpeech: "adverb", expectedTranslation: "correctement", translationSource: "dictionary" },
  {
    id: "adv2",
    original: "быстро",
    lemma: "быстро",
    partOfSpeech: "adverb",
    expectedTranslation: "vite",
    translationSource: "KnowledgeLemma",
    lemmaFrenchComparison: "vite",
  },
  {
    id: "adv3",
    original: "медленно",
    lemma: "медленно",
    partOfSpeech: "adverb",
    expectedTranslation: "lentement",
    translationSource: "KnowledgeLemma",
    lemmaFrenchComparison: "lentement",
  },
  // pronouns
  { id: "p1", original: "я", lemma: "я", partOfSpeech: "pronoun", expectedTranslation: "je", translationSource: "dictionary" },
  { id: "p2", original: "ты", lemma: "ты", partOfSpeech: "pronoun", expectedTranslation: "tu", translationSource: "dictionary" },
  { id: "p3", original: "он", lemma: "он", partOfSpeech: "pronoun", expectedTranslation: "il", translationSource: "dictionary" },
  { id: "p4", original: "она", lemma: "она", partOfSpeech: "pronoun", expectedTranslation: "elle", translationSource: "dictionary" },
  { id: "p5", original: "мы", lemma: "мы", partOfSpeech: "pronoun", expectedTranslation: "nous", translationSource: "dictionary" },
  { id: "p6", original: "вы", lemma: "вы", partOfSpeech: "pronoun", expectedTranslation: "vous", translationSource: "dictionary" },
  { id: "p7", original: "они", lemma: "они", partOfSpeech: "pronoun", expectedTranslation: "ils", translationSource: "dictionary" },
  { id: "p8", original: "это", lemma: "это", partOfSpeech: "pronoun", expectedTranslation: "c'est / ce", translationSource: "dictionary" },
  // prepositions
  { id: "prep1", original: "в", lemma: "в", partOfSpeech: "preposition", expectedTranslation: "dans / en", translationSource: "dictionary" },
  { id: "prep2", original: "на", lemma: "на", partOfSpeech: "preposition", expectedTranslation: "sur / à", translationSource: "dictionary" },
  { id: "prep3", original: "с", lemma: "с", partOfSpeech: "preposition", expectedTranslation: "avec / de", translationSource: "dictionary" },
  { id: "prep4", original: "к", lemma: "к", partOfSpeech: "preposition", expectedTranslation: "vers / chez", translationSource: "dictionary" },
  { id: "prep5", original: "у", lemma: "у", partOfSpeech: "preposition", expectedTranslation: "chez / de", translationSource: "dictionary" },
  { id: "prep6", original: "о", lemma: "о", partOfSpeech: "preposition", expectedTranslation: "sur / à propos de", translationSource: "dictionary" },
  { id: "prep7", original: "за", lemma: "за", partOfSpeech: "preposition", expectedTranslation: "après / derrière", translationSource: "dictionary" },
  // conjunctions
  { id: "c1", original: "и", lemma: "и", partOfSpeech: "conjunction", expectedTranslation: "et", translationSource: "dictionary" },
  { id: "c2", original: "но", lemma: "но", partOfSpeech: "conjunction", expectedTranslation: "mais", translationSource: "dictionary" },
  { id: "c3", original: "а", lemma: "а", partOfSpeech: "conjunction", expectedTranslation: "mais / et", translationSource: "dictionary" },
  { id: "c4", original: "или", lemma: "или", partOfSpeech: "conjunction", expectedTranslation: "ou", translationSource: "dictionary" },
  { id: "c5", original: "что", lemma: "что", partOfSpeech: "conjunction", expectedTranslation: "que", translationSource: "dictionary" },
  { id: "c6", original: "когда", lemma: "когда", partOfSpeech: "conjunction", expectedTranslation: "quand", translationSource: "dictionary" },
  { id: "c7", original: "если", lemma: "если", partOfSpeech: "conjunction", expectedTranslation: "si", translationSource: "dictionary" },
  { id: "c8", original: "как", lemma: "как", partOfSpeech: "conjunction", expectedTranslation: "comme", translationSource: "dictionary" },
  // particles
  { id: "part1", original: "даже", lemma: "даже", partOfSpeech: "particle", expectedTranslation: "même", translationSource: "dictionary" },
  {
    id: "part2",
    original: "ли",
    lemma: "ли",
    partOfSpeech: "particle",
    expectedTranslation: "particule interrogative",
    translationSource: "KnowledgeLemma",
    lemmaFrenchComparison: "particule interrogative",
  },
  // missing lexical data → —
  {
    id: "miss1",
    original: "неизвестно",
    lemma: "неизвестно",
    partOfSpeech: "adverb",
    expectedTranslation: "—",
    translationSource: "none",
    explanation: "Adverbe rare sans entrée lexicale.",
  },
  {
    id: "miss2",
    original: "xyzabc",
    lemma: "xyzabc",
    partOfSpeech: "noun",
    expectedTranslation: "—",
    translationSource: "none",
  },
  { id: "kl1", original: "кот", lemma: "кот", partOfSpeech: "noun", expectedTranslation: "chat", translationSource: "KnowledgeLemma", lemmaFrenchComparison: "chat" },
  { id: "kl2", original: "собака", lemma: "собака", partOfSpeech: "noun", expectedTranslation: "chien", translationSource: "KnowledgeLemma", lemmaFrenchComparison: "chien" },
  { id: "kl3", original: "школа", lemma: "школа", partOfSpeech: "noun", expectedTranslation: "école", translationSource: "KnowledgeLemma", lemmaFrenchComparison: "école" },
  { id: "kl4", original: "улица", lemma: "улица", partOfSpeech: "noun", expectedTranslation: "rue", translationSource: "KnowledgeLemma", lemmaFrenchComparison: "rue" },
  { id: "kl5", original: "город", lemma: "город", partOfSpeech: "noun", expectedTranslation: "ville", translationSource: "KnowledgeLemma", lemmaFrenchComparison: "ville" },
  { id: "kl6", original: "писать", lemma: "писать", partOfSpeech: "verb", expectedTranslation: "écrire", translationSource: "KnowledgeLemma", lemmaFrenchComparison: "écrire" },
  { id: "kl7", original: "говорить", lemma: "говорить", partOfSpeech: "verb", expectedTranslation: "parler", translationSource: "KnowledgeLemma", lemmaFrenchComparison: "parler" },
  { id: "kl8", original: "красный", lemma: "красный", partOfSpeech: "adjective", expectedTranslation: "rouge", translationSource: "KnowledgeLemma", lemmaFrenchComparison: "rouge" },
  { id: "kl9", original: "синий", lemma: "синий", partOfSpeech: "adjective", expectedTranslation: "bleu", translationSource: "KnowledgeLemma", lemmaFrenchComparison: "bleu" },
  { id: "kl10", original: "зелёный", lemma: "зелёный", partOfSpeech: "adjective", expectedTranslation: "vert", translationSource: "KnowledgeLemma", lemmaFrenchComparison: "vert" },
];

export function fixtureToDetail(fixture: SemanticFixture): WordDetailGraph {
  const lemmaEntity =
    fixture.lemmaFrenchComparison && fixture.translationSource === "KnowledgeLemma"
      ? stubLemmaEntity({
          id: `lemma-${fixture.id}`,
          lemma: fixture.lemma,
          partOfSpeech: fixture.partOfSpeech,
          stressMarked: fixture.original,
          canonicalExplanation: fixture.explanation ?? "Explication pédagogique du lemme.",
          frenchComparison: fixture.lemmaFrenchComparison,
        })
      : null;

  return buildWordDetail({
    occurrence: {
      original: fixture.original,
      stressMarked: fixture.original,
      lemma: fixture.lemma,
      partOfSpeech: fixture.partOfSpeech,
      stem: fixture.original,
      ending: "",
      case: null,
      gender: null,
      number: null,
      tense: null,
      aspect: null,
      explanation: fixture.explanation ?? "",
      frequency: null,
      translationCanonical: null,
      translationAlternatives: [],
    },
    canonicalExplanation: fixture.canonicalExplanation ?? "",
    frenchComparisonCanonical: fixture.frenchComparisonCanonical ?? null,
    domain: {
      form: null,
      lemma: lemmaEntity,
      ending: null,
      case: null,
      concepts: [],
      expression: null,
      collocation: null,
    },
    lemmaKnowledge: lemmaEntity
      ? stubLemmaKnowledge({
          lemma: lemmaEntity.lemma,
          partOfSpeech: lemmaEntity.partOfSpeech,
          frenchComparison: lemmaEntity.frenchComparison,
          canonicalExplanation: lemmaEntity.canonicalExplanation,
          occurrenceCount: 1,
          seenInTexts: 1,
        })
      : null,
  });
}

// Expand to 100+ by duplicating dictionary coverage with inflected forms
const EXTRA_DICTIONARY_FORMS: Array<Omit<SemanticFixture, "id">> = [
  { original: "яблоня", lemma: "яблоня", partOfSpeech: "noun", expectedTranslation: "pommier", translationSource: "dictionary" },
  { original: "груша", lemma: "груша", partOfSpeech: "noun", expectedTranslation: "poire", translationSource: "dictionary" },
  { original: "расцветать", lemma: "расцветать", partOfSpeech: "verb", expectedTranslation: "fleurir", translationSource: "dictionary" },
  { original: "расцветала", lemma: "расцветать", partOfSpeech: "verb", expectedTranslation: "fleurir", translationSource: "dictionary" },
  { original: "начинать", lemma: "начинать", partOfSpeech: "verb", expectedTranslation: "commencer", translationSource: "dictionary" },
  { original: "начинаем", lemma: "начинать", partOfSpeech: "verb", expectedTranslation: "commencer", translationSource: "dictionary" },
  { original: "морозный", lemma: "морозный", partOfSpeech: "adjective", expectedTranslation: "glacial", translationSource: "dictionary" },
  { original: "морозные", lemma: "морозный", partOfSpeech: "adjective", expectedTranslation: "glaciales", translationSource: "dictionary" },
  { original: "дерево", lemma: "дерево", partOfSpeech: "noun", expectedTranslation: "arbre", translationSource: "dictionary" },
  { original: "деревья", lemma: "дерево", partOfSpeech: "noun", expectedTranslation: "arbres", translationSource: "dictionary" },
  { original: "городок", lemma: "городок", partOfSpeech: "noun", expectedTranslation: "petite ville", translationSource: "dictionary" },
  { original: "больной", lemma: "больной", partOfSpeech: "adjective", expectedTranslation: "malade", translationSource: "dictionary" },
  { original: "больная", lemma: "больной", partOfSpeech: "adjective", expectedTranslation: "malade", translationSource: "dictionary" },
  { original: "обычный", lemma: "обычный", partOfSpeech: "adjective", expectedTranslation: "habituel / ordinaire", translationSource: "dictionary" },
  { original: "иной", lemma: "иной", partOfSpeech: "adjective", expectedTranslation: "autre", translationSource: "dictionary" },
  { original: "дым", lemma: "дым", partOfSpeech: "noun", expectedTranslation: "fumée", translationSource: "dictionary" },
  { original: "получиться", lemma: "получиться", partOfSpeech: "verb", expectedTranslation: "réussir", translationSource: "dictionary" },
  { original: "быть", lemma: "быть", partOfSpeech: "verb", expectedTranslation: "être", translationSource: "dictionary" },
  { original: "привет", lemma: "привет", partOfSpeech: "noun", expectedTranslation: "salut", translationSource: "dictionary" },
  { original: "морозной", lemma: "морозный", partOfSpeech: "adjective", expectedTranslation: "glacial", translationSource: "dictionary" },
  { original: "дереве", lemma: "дерево", partOfSpeech: "noun", expectedTranslation: "arbre", translationSource: "dictionary" },
  { original: "яблоню", lemma: "яблоня", partOfSpeech: "noun", expectedTranslation: "pommier", translationSource: "dictionary" },
  { original: "груш", lemma: "груша", partOfSpeech: "noun", expectedTranslation: "poire", translationSource: "dictionary" },
  { original: "больное", lemma: "больной", partOfSpeech: "adjective", expectedTranslation: "malade", translationSource: "dictionary" },
];

for (const [index, extra] of EXTRA_DICTIONARY_FORMS.entries()) {
  SEMANTIC_FIXTURES.push({ id: `extra-${index}`, ...extra });
}

const POS_HINTS: Record<string, PartOfSpeech> = {
  расцветать: "verb", расцветали: "verb", расцветала: "verb", начинать: "verb", начинает: "verb",
  начинаем: "verb", получится: "verb", получиться: "verb", быть: "verb", есть: "verb",
  морозный: "adjective", морозная: "adjective", морозной: "adjective", морозные: "adjective",
  иной: "adjective", иного: "adjective", больной: "adjective", больных: "adjective",
  больная: "adjective", больное: "adjective", обычный: "adjective", обычные: "adjective",
  большой: "adjective", маленький: "adjective", новый: "adjective", старый: "adjective",
  хороший: "adjective", русский: "adjective", правильно: "adverb",
  за: "preposition", у: "preposition", в: "preposition", на: "preposition", с: "preposition",
  к: "preposition", о: "preposition", и: "conjunction", но: "conjunction", а: "conjunction",
  или: "conjunction", что: "conjunction", как: "conjunction", когда: "conjunction", если: "conjunction",
  даже: "particle", он: "pronoun", она: "pronoun", они: "pronoun", мы: "pronoun", вы: "pronoun",
  я: "pronoun", ты: "pronoun", это: "pronoun",
};

for (const [index, [key, gloss]] of Object.entries(LOCAL_DICTIONARY_GLOSS).entries()) {
  if (SEMANTIC_FIXTURES.some((f) => f.original === key)) {
    continue;
  }
  SEMANTIC_FIXTURES.push({
    id: `dict-${index}`,
    original: key,
    lemma: key,
    partOfSpeech: POS_HINTS[key] ?? "noun",
    expectedTranslation: gloss,
    translationSource: "dictionary",
  });
}

export const ALL_SEMANTIC_FIXTURES = SEMANTIC_FIXTURES;
