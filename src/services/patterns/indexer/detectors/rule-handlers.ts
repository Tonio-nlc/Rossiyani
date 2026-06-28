import { normalizeCaseKey } from "@/lib/grammar/normalize-case-key";
import type { WordAnalysisOutput } from "@/services/ai/schemas";

import type { DetectionCandidate, DetectionContext, DetectionRuleHandler } from "./types";

function spanFromPositions(positions: number[]): DetectionCandidate["span"] {
  const sorted = [...positions].sort((a, b) => a - b);
  return {
    startPosition: sorted[0] ?? 0,
    endPosition: sorted[sorted.length - 1] ?? 0,
  };
}

function nominalWords(words: WordAnalysisOutput[]): WordAnalysisOutput[] {
  return words.filter(
    (word) => word.partOfSpeech === "noun" || word.partOfSpeech === "adjective",
  );
}

function buildCandidate(
  patternId: string,
  positions: number[],
  confidence: number,
  detectionScore: number,
  evidence: DetectionCandidate["evidence"],
): DetectionCandidate {
  return {
    patternId,
    span: spanFromPositions(positions),
    confidence,
    detectionScore,
    evidence,
    triggeringTokens: [...positions].sort((a, b) => a - b),
  };
}

export const detectNounEndingVariation: DetectionRuleHandler = ({ analysis, pattern }) => {
  const nominals = nominalWords(analysis.words);
  if (nominals.length === 0) {
    return null;
  }

  const byLemma = new Map<string, WordAnalysisOutput[]>();
  for (const word of nominals) {
    const bucket = byLemma.get(word.lemma.toLowerCase()) ?? [];
    bucket.push(word);
    byLemma.set(word.lemma.toLowerCase(), bucket);
  }

  for (const words of byLemma.values()) {
    const endings = new Set(words.map((word) => word.ending));
    if (words.length >= 2 && endings.size > 1) {
      const positions = words.map((word) => word.position);
      const weight = pattern.detectionRules.find((rule) => rule.rule === "noun_ending_variation_same_lemma")
        ?.weight ?? 0.7;
      return buildCandidate(
        pattern.id,
        positions,
        0.9,
        weight,
        [
          {
            source: "detection_rule",
            rule: "noun_ending_variation_same_lemma",
            message: `Même lemme (${words[0]!.lemma}) avec terminaisons différentes`,
            weight,
          },
        ],
      );
    }
  }

  const inflected = nominals.filter((word) => {
    const caseKey = normalizeCaseKey(word.case);
    return caseKey && caseKey !== "nominative";
  });

  if (inflected.length >= 1) {
    const positions = inflected.map((word) => word.position);
    const weight =
      pattern.detectionRules.find((rule) => rule.rule === "noun_ending_variation_same_lemma")?.weight ??
      0.7;
    return buildCandidate(
      pattern.id,
      positions,
      inflected.length >= 2 ? 0.85 : 0.65,
      weight * (inflected.length >= 2 ? 1 : 0.75),
      [
        {
          source: "detection_rule",
          rule: "noun_ending_variation_same_lemma",
          message: `${inflected.length} nom(s) avec cas non-nominatif`,
          weight,
        },
      ],
    );
  }

  return null;
};

const SUBJECT_PRONOUNS = new Set(["я", "ты", "он", "она", "оно", "мы", "вы", "они"]);

export const detectUGenitiveExistence: DetectionRuleHandler = ({ analysis, pattern }) => {
  const words = analysis.words;
  const uIndex = words.findIndex((word) => word.original.toLowerCase() === "у" || word.lemma === "у");
  if (uIndex < 0) {
    return null;
  }

  const uWord = words[uIndex]!;
  const nextWords = words.slice(uIndex + 1, uIndex + 4);
  const hasPossessive = nextWords.some((word) =>
    ["меня", "тебя", "его", "её", "нас", "вас", "их", "него", "неё", "них"].includes(
      word.lemma.toLowerCase(),
    ),
  );
  const hasExistence = words.some(
    (word) => word.lemma.toLowerCase() === "есть" || word.lemma.toLowerCase() === "нет",
  );
  const hasGenitiveNominal = nextWords.some(
    (word) =>
      (word.partOfSpeech === "noun" || word.partOfSpeech === "adjective") &&
      normalizeCaseKey(word.case) === "genitive",
  );

  if (!hasPossessive && !hasGenitiveNominal) {
    return null;
  }

  const positions = [uWord.position];
  for (const word of nextWords) {
    positions.push(word.position);
    if (word.partOfSpeech === "noun") {
      break;
    }
  }

  const weight =
    pattern.detectionRules.find((rule) => rule.rule === "u_genitive_existence")?.weight ?? 0.85;

  return buildCandidate(
    pattern.id,
    positions,
    hasExistence ? 0.95 : 0.8,
    weight,
    [
      {
        source: "detection_rule",
        rule: "u_genitive_existence",
        message: hasExistence
          ? "Construction у + possession avec есть/нет"
          : "Construction у + génitif (possession / existence)",
        weight,
      },
    ],
  );
};

export const detectZeroSubject: DetectionRuleHandler = ({ analysis, pattern }) => {
  const hasSubjectPronoun = analysis.words.some(
    (word) => word.partOfSpeech === "pronoun" && SUBJECT_PRONOUNS.has(word.lemma.toLowerCase()),
  );
  const verbs = analysis.words.filter((word) => word.partOfSpeech === "verb");
  if (verbs.length === 0 || hasSubjectPronoun) {
    return null;
  }

  const finiteVerbs = verbs.filter((word) => word.tense || word.original !== word.lemma);
  if (finiteVerbs.length === 0) {
    return null;
  }

  const positions = finiteVerbs.map((word) => word.position);
  const weight =
    pattern.detectionRules.find((rule) => rule.rule === "finite_verb_without_explicit_subject")
      ?.weight ?? 0.6;

  return buildCandidate(
    pattern.id,
    positions,
    0.75,
    weight,
    [
      {
        source: "detection_rule",
        rule: "finite_verb_without_explicit_subject",
        message: "Verbe conjugué sans pronom sujet explicite",
        weight,
      },
    ],
  );
};

const TRANSFER_VERBS = new Set([
  "дать",
  "сказать",
  "звонить",
  "писать",
  "показать",
  "отправить",
  "передать",
  "рассказать",
]);

export const detectDativeRecipient: DetectionRuleHandler = ({ analysis, pattern }) => {
  const hits: number[] = [];

  for (const word of analysis.words) {
    if (word.partOfSpeech !== "verb" || !TRANSFER_VERBS.has(word.lemma.toLowerCase())) {
      continue;
    }

    const dativeAfter = analysis.words.find(
      (candidate) =>
        candidate.position > word.position &&
        (candidate.partOfSpeech === "noun" || candidate.partOfSpeech === "pronoun") &&
        normalizeCaseKey(candidate.case) === "dative",
    );

    if (dativeAfter) {
      hits.push(word.position, dativeAfter.position);
    }
  }

  if (hits.length === 0) {
    return null;
  }

  const weight =
    pattern.detectionRules.find((rule) => rule.rule === "dative_noun_after_transfer_verb")?.weight ??
    0.8;

  return buildCandidate(pattern.id, hits, 0.88, weight, [
    {
      source: "detection_rule",
      rule: "dative_noun_after_transfer_verb",
      message: "Verbe de transfert / communication + complément au datif",
      weight,
    },
  ]);
};

const VALENCY_FRAMES: Array<{
  verbLemma: string;
  caseKey: ReturnType<typeof normalizeCaseKey>;
  label: string;
}> = [
  { verbLemma: "помогать", caseKey: "dative", label: "помогать + datif" },
  { verbLemma: "интересоваться", caseKey: "instrumental", label: "интересоваться + instrumental" },
  { verbLemma: "гордиться", caseKey: "instrumental", label: "гордиться + instrumental" },
  { verbLemma: "учиться", caseKey: "instrumental", label: "учиться + instrumental" },
];

export const detectVerbValency: DetectionRuleHandler = ({ analysis, pattern }) => {
  const hits: number[] = [];

  for (const frame of VALENCY_FRAMES) {
    const verb = analysis.words.find(
      (word) => word.partOfSpeech === "verb" && word.lemma.toLowerCase() === frame.verbLemma,
    );
    if (!verb) {
      continue;
    }

    const governed = analysis.words.find(
      (word) =>
        word.position > verb.position &&
        normalizeCaseKey(word.case) === frame.caseKey &&
        word.partOfSpeech !== "preposition",
    );

    if (governed) {
      hits.push(verb.position, governed.position);
    }
  }

  if (hits.length === 0) {
    return null;
  }

  const weight =
    pattern.detectionRules.find((rule) => rule.rule === "verb_governed_case_mismatch")?.weight ??
    0.75;

  return buildCandidate(pattern.id, hits, 0.82, weight, [
    {
      source: "detection_rule",
      rule: "verb_governed_case_mismatch",
      message: "Construction verbale à valence fixe détectée",
      weight,
    },
  ]);
};

function normalizeStem(lemma: string): string {
  return lemma.toLowerCase().replace(/^(по|на|вы|в|с|у|о|при|пере|про)/, "");
}

export const detectAspectPair: DetectionRuleHandler = ({ analysis, pattern }) => {
  const verbs = analysis.words.filter((word) => word.partOfSpeech === "verb");
  if (verbs.length === 0) {
    return null;
  }

  const byStem = new Map<string, WordAnalysisOutput[]>();
  for (const verb of verbs) {
    const stem = normalizeStem(verb.lemma);
    const bucket = byStem.get(stem) ?? [];
    bucket.push(verb);
    byStem.set(stem, bucket);
  }

  for (const group of byStem.values()) {
    const aspects = new Set(
      group.map((word) => word.aspect?.toLowerCase()).filter((value): value is string => !!value),
    );
    if (group.length >= 2 && aspects.size > 1) {
      const positions = group.map((word) => word.position);
      const weight =
        pattern.detectionRules.find((rule) => rule.rule === "aspect_pair_same_stem")?.weight ?? 0.7;
      return buildCandidate(pattern.id, positions, 0.9, weight, [
        {
          source: "detection_rule",
          rule: "aspect_pair_same_stem",
          message: "Paire aspectuelle (même socle, aspects différents)",
          weight,
        },
      ]);
    }
  }

  const aspectMarked = verbs.filter((word) => {
    const aspect = word.aspect?.toLowerCase();
    return aspect === "perfective" || aspect === "imperfective";
  });

  if (aspectMarked.length >= 1) {
    const positions = aspectMarked.map((word) => word.position);
    const weight =
      pattern.detectionRules.find((rule) => rule.rule === "aspect_pair_same_stem")?.weight ?? 0.7;
    return buildCandidate(pattern.id, positions, 0.7, weight * 0.85, [
      {
        source: "detection_rule",
        rule: "aspect_pair_same_stem",
        message: "Verbe avec marque aspectuelle explicite",
        weight,
      },
    ]);
  }

  return null;
};

export const detectConceptMapping: DetectionRuleHandler = ({ pattern, conceptKeys }) => {
  if (pattern.knowledgeConceptKeys.length === 0 || conceptKeys.length === 0) {
    return null;
  }

  const matched = pattern.knowledgeConceptKeys.filter((key) => conceptKeys.includes(key));
  if (matched.length === 0) {
    return null;
  }

  const ratio = matched.length / pattern.knowledgeConceptKeys.length;
  const confidence = Math.min(0.95, 0.55 + ratio * 0.4);
  const detectionScore = confidence * 0.6;

  return {
    patternId: pattern.id,
    span: { startPosition: 0, endPosition: Math.max(0, conceptKeys.length - 1) },
    confidence,
    detectionScore,
    evidence: matched.map((conceptKey) => ({
      source: "concept_mapping" as const,
      conceptKey,
      message: `Concept Knowledge Graph : ${conceptKey}`,
      weight: detectionScore / matched.length,
    })),
    triggeringTokens: [],
  };
};

export const DETECTION_RULE_HANDLERS: Record<string, DetectionRuleHandler> = {
  noun_ending_variation_same_lemma: detectNounEndingVariation,
  u_genitive_existence: detectUGenitiveExistence,
  finite_verb_without_explicit_subject: detectZeroSubject,
  dative_noun_after_transfer_verb: detectDativeRecipient,
  verb_governed_case_mismatch: detectVerbValency,
  aspect_pair_same_stem: detectAspectPair,
};
