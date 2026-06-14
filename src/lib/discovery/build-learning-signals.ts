import { getExplorationHistory } from "@/lib/explorer/exploration-history";
import { getSavedComposePhrases } from "@/lib/compose/saved-phrases";
import { getAllReadingProgress } from "@/lib/reader/reading-progress";
import type { LearningSignals } from "@/features/discovery";
import { getDiscoveryArchive } from "@/lib/discovery/saved-discoveries";
import { getRecentManualLessonSlugs } from "@/lib/manual/manual-lesson-history";

const TOPIC_KEYWORDS: Record<string, string[]> = {
  motion: ["ехать", "идти", "ходить", "поехать", "добираться", "приезжать", "ездить"],
  internet: ["жиза", "кек", "мем", "чат", "онлайн"],
  conversation: ["привет", "спасибо", "конечно", "ладно", "давай"],
};

function inferTopics(labels: string[]): string[] {
  const topics = new Set<string>();
  const haystack = labels.join(" ").toLowerCase();

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      topics.add(topic);
    }
  }

  return [...topics];
}

export function buildLearningSignals(): LearningSignals {
  const exploration = getExplorationHistory();
  const reading = getAllReadingProgress();
  const savedPhrases = getSavedComposePhrases();
  const archive = getDiscoveryArchive();
  const discoveryArchive = archive.map((entry) => ({
    candidateId: entry.id,
    dateKey: entry.dateKey,
  }));
  const featuredHistory = discoveryArchive.map((entry) => entry.candidateId);

  const exploredLemmas = exploration
    .filter((entry) => entry.kind === "lemma")
    .map((entry) => entry.label);
  const exploredConcepts = exploration
    .filter((entry) => entry.kind === "concept")
    .map((entry) => entry.label);
  const exploredPhrases = exploration
    .filter((entry) => entry.kind === "phrase")
    .map((entry) => entry.label);
  const readTextIds = Object.keys(reading);
  const practiceStructures = savedPhrases.flatMap((phrase) =>
    phrase.structures.map((structure) => structure.label),
  );
  const savedPhraseTexts = savedPhrases.map((phrase) => phrase.originalSentence);
  const recentTopics = inferTopics([
    ...exploredLemmas,
    ...exploredPhrases,
    ...practiceStructures,
  ]);

  return {
    exploredLemmas,
    exploredConcepts,
    exploredPhrases,
    readTextIds,
    practiceStructures,
    savedPhraseTexts,
    recentTopics,
    discoveryArchive,
    recentManualLessonSlugs: getRecentManualLessonSlugs(),
    featuredHistory,
  };
}

export function serializeLearningSignals(signals: LearningSignals): string {
  return encodeURIComponent(JSON.stringify(signals));
}
