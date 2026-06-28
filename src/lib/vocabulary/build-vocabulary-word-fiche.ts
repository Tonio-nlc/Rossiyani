import type { PartOfSpeech } from "@prisma/client";

import { conceptPath, lemmaPath, textPath } from "@/components/explorer/explorer-routes";
import { isCaseConcept } from "@/features/explorer/entity/explorer-eligibility";
import { resolveLemmaEntity } from "@/features/explorer/entity/resolve-lemma";
import { formatCaseLabelFr } from "@/features/grammar";
import {
  buildLemmaDefinitions,
  estimatedLevelFromLemma,
  explorerFrequencyLabel,
  relatedCasesFromLemma,
} from "@/lib/explorer/explorer-ia";
import { buildFrequencyVisual, formatPosLabelFr } from "@/lib/explorer/lemma-display";
import { prisma } from "@/lib/prisma";
import type { LemmaKnowledge } from "@/types/knowledge-graph";

import type {
  VocabularyFicheExample,
  VocabularyFicheFormRow,
  VocabularyFicheLink,
  VocabularyFichePhrase,
  VocabularyFicheRow,
  VocabularyLinguisticDetails,
  VocabularyWordFiche,
} from "./vocabulary-word-fiche-types";
import { buildVocabularyPatternSlice } from "@/services/vocabulary/build-vocabulary-pattern-slice";

const IRREGULAR_VERBS = new Set([
  "быть",
  "мочь",
  "хотеть",
  "дать",
  "есть",
  "идти",
  "ехать",
  "жить",
  "бежать",
  "лежать",
  "стоять",
  "сидеть",
]);

const PHRASE_TYPE_LABELS: Record<string, string> = {
  EXPRESSION: "Expression",
  COLLOCATION: "Collocation",
  NATIVE_CONSTRUCTION: "Construction",
  IDIOM: "Expression idiomatique",
};

function inferConjugation(lemma: string): string | null {
  const inf = lemma.trim().toLowerCase();
  if (!inf) {
    return null;
  }
  if (IRREGULAR_VERBS.has(inf)) {
    return "Verbe irrégulier";
  }
  if (inf.endsWith("ить")) {
    return "2e conjugaison";
  }
  if (/ать$|ять$|еть$|оть$|уть$|ыть$/.test(inf)) {
    return "1re conjugaison";
  }
  return null;
}

function formatFrequencyLabelFr(knowledge: LemmaKnowledge): string | null {
  const visual = buildFrequencyVisual(
    knowledge.frequency,
    knowledge.frequencyTier,
    knowledge.occurrenceCount,
  );
  if (!visual) {
    return explorerFrequencyLabel(knowledge.occurrenceCount);
  }
  switch (knowledge.frequencyTier) {
    case "TOP_500":
      return "Vocabulaire essentiel";
    case "TOP_1000":
      return "Courant";
    case "TOP_3000":
      return "Fréquent";
    case "BEYOND_TOP_3000":
      return "Avancé";
    default:
      if (visual.filledStars >= 4) {
        return "Vocabulaire essentiel";
      }
      if (visual.filledStars >= 3) {
        return "Courant";
      }
      if (visual.filledStars >= 2) {
        return "Fréquent";
      }
      return "Peu fréquent dans vos textes";
  }
}

function inferAnimacy(explanation: string | null): string | null {
  if (!explanation) {
    return null;
  }
  const lower = explanation.toLowerCase();
  if (/animé|animate/i.test(lower)) {
    return "Animé";
  }
  if (/inanimé|inanimate/i.test(lower)) {
    return "Inanimé";
  }
  return null;
}

function inferGenderFromForms(knowledge: LemmaKnowledge): string | null {
  const genders = new Set(
    knowledge.forms.map((form) => form.gender).filter((value): value is string => Boolean(value)),
  );
  if (genders.size === 1) {
    const gender = [...genders][0];
    if (gender === "masculine") {
      return "Masculin";
    }
    if (gender === "feminine") {
      return "Féminin";
    }
    if (gender === "neuter") {
      return "Neutre";
    }
  }
  return null;
}

function buildGrammarSection(
  knowledge: LemmaKnowledge,
): NonNullable<VocabularyLinguisticDetails["grammar"]> | null {
  const rows: VocabularyFicheRow[] = [];
  const pos = knowledge.partOfSpeech;
  let title = "Grammaire";
  let note: string | null = null;

  if (pos === "verb") {
    title = "Verbe";
    if (knowledge.dominantAspect) {
      rows.push({ label: "Aspect dominant", value: knowledge.dominantAspect });
    }
    if (knowledge.aspectPartner) {
      rows.push({
        label: "Paire d'aspect",
        value: `${knowledge.lemma} ↔ ${knowledge.aspectPartner.lemma}`,
      });
    }
    const conjugation = inferConjugation(knowledge.lemma);
    if (conjugation) {
      rows.push({ label: "Conjugaison", value: conjugation });
    }
    if (knowledge.lemma.endsWith("ся") || knowledge.lemma.endsWith("сь")) {
      rows.push({ label: "Réfléchi", value: "Oui" });
    }
    const collocation = knowledge.phrases.find((phrase) => phrase.type === "COLLOCATION");
    if (collocation) {
      rows.push({ label: "Construction fréquente", value: collocation.label });
    }
  } else if (pos === "noun") {
    title = "Nom";
    rows.push({ label: "Lemme", value: knowledge.lemma });
    const gender = inferGenderFromForms(knowledge);
    if (gender) {
      rows.push({ label: "Genre", value: gender });
    }
    const animacy = inferAnimacy(knowledge.canonicalExplanation);
    if (animacy) {
      rows.push({ label: "Animé / inanimé", value: animacy });
    }
    const pluralForms = knowledge.forms.filter((form) => form.number === "plural");
    if (pluralForms.length > 0) {
      rows.push({
        label: "Pluriel observé",
        value: [...new Set(pluralForms.map((form) => form.original))].slice(0, 3).join(", "),
      });
    }
    const cases = relatedCasesFromLemma(knowledge);
    if (cases.length > 0) {
      note = `Déclinaisons observées : ${cases.map((item) => item.label).join(", ")}`;
    }
  } else if (pos === "adjective") {
    title = "Adjectif";
    rows.push({ label: "Lemme", value: knowledge.lemma });
    const gender = inferGenderFromForms(knowledge);
    if (gender) {
      rows.push({ label: "Genre de base", value: gender });
    }
    note = "Les formes ci-dessous montrent les accords observés dans vos textes.";
  } else {
    title = formatPosLabelFr(pos);
    if (knowledge.simpleExplanation) {
      rows.push({ label: "Remarque", value: knowledge.simpleExplanation });
    }
  }

  const forms: VocabularyFicheFormRow[] = knowledge.forms.slice(0, 12).map((form) => ({
    id: form.id,
    form: form.original,
    case: form.case ? (formatCaseLabelFr(form.case) ?? form.case) : null,
    ending: form.ending || null,
    gender:
      form.gender === "masculine"
        ? "Masc."
        : form.gender === "feminine"
          ? "Fém."
          : form.gender === "neuter"
            ? "Neutre"
            : null,
    number:
      form.number === "singular"
        ? "Sing."
        : form.number === "plural"
          ? "Plur."
          : null,
    tense: form.tense ?? null,
    aspect: form.aspect ?? null,
  }));

  if (rows.length === 0 && forms.length === 0) {
    return null;
  }

  return { title, rows, forms, note };
}

function mapExamples(knowledge: LemmaKnowledge): VocabularyFicheExample[] {
  return knowledge.examples
    .filter((example) => example.sentenceRussian.trim().length > 0)
    .slice(0, 6)
    .map((example) => ({
      id: example.id,
      russian: example.sentenceRussian,
      translation: example.naturalTranslation,
      textId: example.textId,
      textTitle: example.textTitle,
      textHref: example.textId ? textPath(example.textId) : null,
      audioCacheKey: `vocab-example:${example.id}`,
    }));
}

function mapExpressions(knowledge: LemmaKnowledge): VocabularyFichePhrase[] {
  return knowledge.phrases
    .filter((phrase) => phrase.type !== "COLLOCATION")
    .slice(0, 8)
    .map((phrase) => ({
      id: phrase.id,
      label: phrase.label,
      type: phrase.type,
      typeLabel: PHRASE_TYPE_LABELS[phrase.type] ?? "Expression",
      occurrenceCount: phrase.occurrenceCount,
    }));
}

function mapFamily(knowledge: LemmaKnowledge): VocabularyFicheLink[] {
  return knowledge.familyLemmas.slice(0, 8).map((family) => ({
    label: family.lemma,
    href: lemmaPath(family.lemma, family.partOfSpeech),
    hint: formatPosLabelFr(family.partOfSpeech),
  }));
}

function mapLinguisticLinks(knowledge: LemmaKnowledge) {
  const collocations = knowledge.phrases
    .filter((phrase) => phrase.type === "COLLOCATION")
    .slice(0, 6)
    .map((phrase) => ({
      label: phrase.label,
      href: `/explorer/collocations/${encodeURIComponent(phrase.label)}`,
      hint: `${phrase.occurrenceCount} occurrence${phrase.occurrenceCount > 1 ? "s" : ""}`,
    }));

  const concepts = [...knowledge.concepts, ...knowledge.relatedConcepts]
    .filter((concept) => !isCaseConcept(concept.conceptKey, concept.category))
    .filter(
      (concept, index, list) =>
        list.findIndex((item) => item.conceptKey === concept.conceptKey) === index,
    )
    .slice(0, 8)
    .map((concept) => ({
      label: concept.title.replace(/\s+case$/i, "").trim(),
      href: conceptPath(concept.conceptKey),
      hint: concept.category,
    }));

  const cases = relatedCasesFromLemma(knowledge).map((item) => ({
    ...item,
    hint: "Cas grammatical",
  }));

  const relatedLemmas = knowledge.familyLemmas.slice(0, 6).map((family) => ({
    label: family.lemma,
    href: lemmaPath(family.lemma, family.partOfSpeech),
    hint: "Famille de mots",
  }));

  return { collocations, concepts, cases, relatedLemmas };
}

async function resolveWordId(
  lemma: string,
  partOfSpeech: PartOfSpeech,
  textId: string,
): Promise<string | null> {
  const word = await prisma.word.findFirst({
    where: {
      lemma,
      partOfSpeech,
      sentence: { textId },
    },
    select: { id: true },
    orderBy: { position: "asc" },
  });
  return word?.id ?? null;
}

async function lookupTextTitle(textId: string): Promise<string | null> {
  const text = await prisma.text.findUnique({
    where: { id: textId },
    select: { title: true },
  });
  return text?.title ?? null;
}

export async function buildVocabularyWordFiche(input: {
  savedWordId: string;
  displayForm: string;
  headword: string | null;
  textId: string;
  savedAt: string;
}): Promise<VocabularyWordFiche | null> {
  const lookupLemma = input.headword?.trim() || input.displayForm.trim();
  if (!lookupLemma) {
    return null;
  }

  const resolved = await resolveLemmaEntity(lookupLemma);
  if (!resolved?.knowledge) {
    return null;
  }

  const knowledge = resolved.knowledge;
  const definitions = buildLemmaDefinitions(knowledge);
  const wordId = await resolveWordId(
    knowledge.lemma,
    resolved.partOfSpeech,
    input.textId,
  );
  const sourceTextTitle = await lookupTextTitle(input.textId);
  const patternSlice = await buildVocabularyPatternSlice({
    lemma: knowledge.lemma,
    partOfSpeech: resolved.partOfSpeech,
    knowledge,
    sourceTextId: input.textId,
  });

  const knowledgeExamples = mapExamples(knowledge);
  const patternExamples = patternSlice.patterns.flatMap((pattern) =>
    pattern.encounteredExamples.map((example) => ({
      id: example.id,
      russian: example.russian,
      translation: example.translation,
      textId: example.textId,
      textTitle: example.textTitle,
      textHref: example.textHref,
      audioCacheKey: example.audioCacheKey,
    })),
  );

  const encounteredExamples = dedupeEncounteredExamples([
    ...patternExamples,
    ...knowledgeExamples,
  ]);

  const grammar = buildGrammarSection(knowledge);
  const linguisticLinks = mapLinguisticLinks(knowledge);

  const falseFriendWarning =
    knowledge.frenchComparison &&
    /faux ami|false friend/i.test(knowledge.frenchComparison)
      ? knowledge.frenchComparison
      : null;

  const linguistic: VocabularyLinguisticDetails = {
    definitions,
    nuances: knowledge.simpleExplanation,
    frenchComparison: knowledge.frenchComparison,
    falseFriendWarning,
    grammar,
    collocations: linguisticLinks.collocations,
    concepts: linguisticLinks.concepts,
    cases: linguisticLinks.cases,
  };

  return {
    savedWordId: input.savedWordId,
    lookupLemma,
    canonicalLemma: knowledge.lemma,
    partOfSpeech: resolved.partOfSpeech,
    partOfSpeechLabel: formatPosLabelFr(resolved.partOfSpeech),
    headline: knowledge.stressMarked ?? knowledge.lemma,
    stressMarked: knowledge.stressMarked,
    primaryTranslation: knowledge.primaryTranslation,
    cefrLevel: estimatedLevelFromLemma(knowledge),
    frequencyLabel: formatFrequencyLabelFr(knowledge),
    audioTarget: wordId
      ? { scope: "word", entityId: wordId }
      : {
          scope: "utterance",
          text: knowledge.stressMarked ?? knowledge.lemma,
          cacheKey: `vocab-word:${input.savedWordId}`,
        },
    patternSlice,
    encounteredExamples,
    family: mapFamily(knowledge),
    variants: grammar?.forms ?? [],
    expressions: mapExpressions(knowledge),
    linguistic,
    review: {
      savedAt: input.savedAt,
      lastSeenAt: input.savedAt,
      sourceTextId: input.textId,
      sourceTextHref: textPath(input.textId),
      sourceTextTitle,
      textCount: knowledge.seenInTexts,
      occurrenceCount: knowledge.occurrenceCount,
    },
    readerHref: textPath(input.textId),
    wordId,
  };
}

function dedupeEncounteredExamples(examples: VocabularyFicheExample[]): VocabularyFicheExample[] {
  const seen = new Set<string>();
  const result: VocabularyFicheExample[] = [];

  for (const example of examples) {
    const key = `${example.textId ?? "x"}:${example.russian}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(example);
  }

  return result.slice(0, 8);
}
