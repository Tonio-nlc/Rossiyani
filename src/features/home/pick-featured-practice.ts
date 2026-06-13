import type { CefrLevel, FeaturedCandidateType } from "@prisma/client";

import { practicePath } from "@/lib/practice/constants";

import { loadCandidateById, loadCandidatePool } from "@/features/discovery/load-candidate-pool";
import { parseJsonStringArray } from "@/features/discovery/parse-json-array";
import type { FeaturedCandidateRow, LearningSignals, TodaysDiscovery } from "@/features/discovery/types";

export type HomeFeaturedPracticeSource = "discovery" | "related" | "personalized" | "editorial";

export type HomeFeaturedPractice = {
  title: string;
  description: string;
  estimatedMinutes: number;
  href: string;
  /** Internal — supports future analytics and personalization tuning. */
  source: HomeFeaturedPracticeSource;
};

export type PickFeaturedPracticeInput = {
  todaysDiscovery: TodaysDiscovery | null;
  signals: LearningSignals;
  reviewLemmas: string[];
};

type EditorialPracticePick = {
  title: string;
  description: string;
  estimatedMinutes: number;
  structure?: string;
  context: string;
};

/** Editor-picked fallbacks when no contextual match is available. */
const EDITOR_FEATURED_PRACTICES: EditorialPracticePick[] = [
  {
    title: "Expressing contrast with несмотря на",
    description: "Write a natural sentence that contrasts two ideas using несмотря на.",
    structure: "несмотря на",
    context: "Use the structure: несмотря на",
    estimatedMinutes: 3,
  },
  {
    title: "Describe your morning routine",
    description: "Practice everyday vocabulary by walking through your typical morning.",
    context: "Describe your morning routine",
    estimatedMinutes: 4,
  },
  {
    title: "Explain a future plan",
    description: "Express what you intend to do soon using natural future-oriented Russian.",
    context: "Express a plan for the near future",
    estimatedMinutes: 3,
  },
];

const CONTRAST_CONSTRUCTIONS = new Set(["несмотря на", "хотя", "вопреки"]);

function estimatePracticeMinutes(difficulty?: CefrLevel): number {
  switch (difficulty) {
    case "A1":
    case "A2":
      return 2;
    case "B1":
      return 3;
    case "B2":
      return 4;
    case "C1":
    case "Native":
      return 5;
    default:
      return 3;
  }
}

function oneSentence(text: string, maxLength = 140): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return "Apply today's pattern in a sentence you might actually say.";
  }

  const first = trimmed.split(/(?<=[.!?])\s+/)[0]?.trim() ?? trimmed;
  return first.length > maxLength ? `${first.slice(0, maxLength - 1)}…` : first;
}

function practiceTitleForCandidate(
  type: FeaturedCandidateType,
  lemma: string,
  topics: string[],
): string {
  const normalizedLemma = lemma.trim();

  if (type === "CONSTRUCTION") {
    if (
      CONTRAST_CONSTRUCTIONS.has(normalizedLemma.toLowerCase()) ||
      topics.includes("contrast")
    ) {
      return `Expressing contrast with ${normalizedLemma}`;
    }
    return `Using the construction ${normalizedLemma}`;
  }

  switch (type) {
    case "WORD":
      return `Using ${normalizedLemma} in context`;
    case "GRAMMAR":
      return `Practicing ${normalizedLemma}`;
    case "COLLOCATION":
      return `Practicing the collocation ${normalizedLemma}`;
    case "EXPRESSION":
    case "NATIVE_PHRASE":
    case "SLANG":
    case "REGIONAL":
      return `Using the expression ${normalizedLemma}`;
    case "CONVERSATION":
      return `Conversation practice: ${normalizedLemma}`;
    default:
      return `Practice with ${normalizedLemma}`;
  }
}

function practiceHrefForCandidate(candidate: FeaturedCandidateRow): string {
  if (candidate.practiceHref) {
    return candidate.practiceHref;
  }

  return practicePath({
    structure: candidate.lemma,
    mode: "structure",
    from: "home",
    context: candidate.subtitle ? `Use the structure: ${candidate.lemma}` : undefined,
  });
}

function practiceFromDiscovery(discovery: TodaysDiscovery): HomeFeaturedPractice {
  return {
    title: practiceTitleForCandidate(discovery.type, discovery.displayLabel, discovery.topics),
    description: oneSentence(discovery.explanation),
    estimatedMinutes: estimatePracticeMinutes(discovery.difficulty),
    href: discovery.practiceHref,
    source: "discovery",
  };
}

function practiceFromCandidate(
  candidate: FeaturedCandidateRow,
  source: HomeFeaturedPracticeSource,
): HomeFeaturedPractice {
  const topics = parseJsonStringArray(candidate.topics);

  return {
    title: practiceTitleForCandidate(candidate.type, candidate.lemma, topics),
    description: oneSentence(
      candidate.explanation ?? `Apply ${candidate.lemma} in a sentence you might actually say.`,
    ),
    estimatedMinutes: estimatePracticeMinutes(candidate.difficulty),
    href: practiceHrefForCandidate(candidate),
    source,
  };
}

function practiceFromEditorialPick(pick: EditorialPracticePick): HomeFeaturedPractice {
  return {
    title: pick.title,
    description: pick.description,
    estimatedMinutes: pick.estimatedMinutes,
    href: practicePath({
      structure: pick.structure,
      mode: pick.structure ? "structure" : undefined,
      from: pick.structure ? "home" : undefined,
      context: pick.context,
    }),
    source: "editorial",
  };
}

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase();
}

function matchesCandidate(candidate: FeaturedCandidateRow, term: string): boolean {
  const normalized = normalizeLabel(term);
  if (normalizeLabel(candidate.lemma) === normalized) {
    return true;
  }

  const relations = parseJsonStringArray(candidate.relations);
  return relations.some((relation) => normalizeLabel(relation) === normalized);
}

function matchesTopic(candidate: FeaturedCandidateRow, topic: string): boolean {
  const topics = parseJsonStringArray(candidate.topics);
  return topics.some((entry) => normalizeLabel(entry) === normalizeLabel(topic));
}

async function pickRelatedPractice(
  signals: LearningSignals,
  reviewLemmas: string[],
): Promise<HomeFeaturedPractice | null> {
  const pool = await loadCandidatePool();
  if (pool.length === 0) {
    return null;
  }

  const searchTerms = [
    ...reviewLemmas,
    ...signals.exploredLemmas,
    ...signals.exploredPhrases,
    ...signals.exploredConcepts,
    ...signals.practiceStructures,
  ];

  for (const term of searchTerms) {
    const match = pool.find((candidate) => matchesCandidate(candidate, term));
    if (match) {
      return practiceFromCandidate(match, "related");
    }
  }

  for (const topic of signals.recentTopics) {
    const match = pool.find((candidate) => matchesTopic(candidate, topic));
    if (match) {
      return practiceFromCandidate(match, "related");
    }
  }

  const recentArchive = signals.discoveryArchive.at(-1);
  if (recentArchive) {
    const archived = await loadCandidateById(recentArchive.candidateId);
    if (archived) {
      return practiceFromCandidate(archived, "related");
    }
  }

  return null;
}

function pickPersonalizedPractice(
  signals: LearningSignals,
  reviewLemmas: string[],
): HomeFeaturedPractice | null {
  const practiced = new Set(signals.practiceStructures.map(normalizeLabel));

  const candidates = [
    ...reviewLemmas,
    ...signals.exploredLemmas,
    ...signals.exploredPhrases,
    ...signals.exploredConcepts,
  ];

  for (const lemma of candidates) {
    const normalized = normalizeLabel(lemma);
    if (normalized.length === 0 || practiced.has(normalized)) {
      continue;
    }

    return {
      title: `Practice vocabulary: ${lemma}`,
      description: `Write a natural sentence that uses ${lemma} in a context you care about.`,
      estimatedMinutes: 3,
      href: practicePath({
        structure: lemma,
        mode: "structure",
        from: "home",
        context: `Use ${lemma} in a natural sentence.`,
      }),
      source: "personalized",
    };
  }

  if (signals.readTextIds.length > 0) {
    return {
      title: "Continue from your reading",
      description: "Turn something you recently read into a sentence you could say out loud.",
      estimatedMinutes: 4,
      href: practicePath({
        context: "Write a sentence inspired by something you read recently.",
      }),
      source: "personalized",
    };
  }

  return null;
}

function pickEditorialPractice(): HomeFeaturedPractice {
  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const pick = EDITOR_FEATURED_PRACTICES[dayBucket % EDITOR_FEATURED_PRACTICES.length]!;
  return practiceFromEditorialPick(pick);
}

/**
 * Selects the homepage featured practice using a fixed priority chain:
 * discovery → related candidate → personalized signals → editorial fallback.
 */
export async function pickFeaturedPractice(
  input: PickFeaturedPracticeInput,
): Promise<HomeFeaturedPractice> {
  if (input.todaysDiscovery) {
    return practiceFromDiscovery(input.todaysDiscovery);
  }

  const related = await pickRelatedPractice(input.signals, input.reviewLemmas);
  if (related) {
    return related;
  }

  const personalized = pickPersonalizedPractice(input.signals, input.reviewLemmas);
  if (personalized) {
    return personalized;
  }

  return pickEditorialPractice();
}
