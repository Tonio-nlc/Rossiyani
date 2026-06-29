import type { ReaderTextData } from "@/features/texts";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import type { ReaderWordGuideView } from "@/types/reader-word-guide";
import type { ReaderPatternExperienceView } from "@/types/reader-pattern-experience";

function normalizeLemma(lemma: string): string {
  return lemma.trim().toLowerCase();
}

function displayForm(word: { stressMarked: string; original: string }): string {
  return word.stressMarked || word.original;
}

function splitPedagogicalCopy(
  experience: ReaderPatternExperienceView,
  hasPriorForm: boolean,
): {
  discovery: string | null;
  explanation: string | null;
} {
  const sections = experience.sections.map((s) => s.content.trim()).filter(Boolean);

  if (experience.phase === "insight") {
    return {
      discovery: hasPriorForm ? "Ce changement n'est pas aléatoire." : null,
      explanation: sections[0] ?? null,
    };
  }

  return {
    discovery: sections[0] ?? null,
    explanation: null,
  };
}

/** Earlier occurrence of the same lemma with a different surface form (reading order). */
function findPriorFormInText(
  text: ReaderTextData,
  snapshot: ReaderWordSnapshot,
): { form: string; wordId: string } | null {
  const lemma = normalizeLemma(snapshot.lemma);
  if (!lemma || lemma.length < 2) {
    return null;
  }

  const currentSentence = text.sentences.find((s) => s.id === snapshot.sentenceId);
  if (!currentSentence) {
    return null;
  }

  for (const sentence of text.sentences) {
    if (sentence.position > currentSentence.position) {
      break;
    }

    for (const word of sentence.words) {
      if (word.id === snapshot.id) {
        continue;
      }
      if (normalizeLemma(word.lemma) !== lemma) {
        continue;
      }

      const form = displayForm(word);
      const current = displayForm(snapshot);
      if (form !== current) {
        return { form, wordId: word.id };
      }
    }
  }

  return null;
}

/**
 * Builds the pedagogical guide panel from orchestrator output + text context.
 * Client-only — does not call the Orchestrator.
 */
export function buildReaderWordGuide(input: {
  text: ReaderTextData;
  snapshot: ReaderWordSnapshot;
  patternExperience: ReaderPatternExperienceView | null;
  isPatternBearer: boolean;
}): ReaderWordGuideView {
  const { text, snapshot, patternExperience, isPatternBearer } = input;
  const currentForm = displayForm(snapshot);
  const sentence = text.sentences.find((s) => s.id === snapshot.sentenceId);
  const exampleLine = sentence?.russianText ?? null;

  if (!isPatternBearer || !patternExperience?.visible) {
    return {
      mode: "lookup",
      headline: null,
      notice: null,
      discovery: null,
      explanation: null,
      exampleLine: null,
      exampleAnchor: null,
      linkedWordIds: [],
    };
  }

  const prior = findPriorFormInText(text, snapshot);
  const linkedWordIds = [snapshot.id];
  if (prior) {
    linkedWordIds.push(prior.wordId);
  }

  const notice = prior
    ? {
        priorForm: prior.form,
        currentForm,
        bridge: "Le mot est presque identique — mais quelque chose a changé.",
      }
    : {
        priorForm: null,
        currentForm,
        bridge: "Regarde bien cette forme dans la phrase.",
      };

  const { discovery, explanation } = splitPedagogicalCopy(patternExperience, prior !== null);

  return {
    mode: "guide",
    headline: patternExperience.title,
    notice,
    discovery,
    explanation,
    exampleLine,
    exampleAnchor: patternExperience.phase === "insight" ? currentForm : null,
    linkedWordIds,
  };
}
