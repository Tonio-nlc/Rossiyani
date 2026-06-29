import type { ReaderTextData } from "@/features/texts";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import { resolveGuideHeadline } from "@/lib/patterns/build-reader-guide-copy";
import type { ReaderPedagogicalDepth } from "@/types/reader-pedagogical-depth";
import { isDepthAtLeast } from "@/types/reader-pedagogical-depth";
import type { ReaderWordGuideView } from "@/types/reader-word-guide";
import type { ReaderPatternCanon } from "@/types/reader-pattern-experience";

function normalizeLemma(lemma: string): string {
  return lemma.trim().toLowerCase();
}

function displayForm(word: { stressMarked: string; original: string }): string {
  return word.stressMarked || word.original;
}

function resolveSentencePattern(
  text: ReaderTextData,
  sentenceId: string,
): { pattern: ReaderPatternCanon; patternId: string } | null {
  const context = text.patternSlice.bySentenceId[sentenceId];
  const patternId = context?.primaryPatternId;
  if (!patternId || !context?.instance) {
    return null;
  }
  const pattern = text.patternSlice.patterns[patternId];
  if (!pattern) {
    return null;
  }
  return { pattern, patternId };
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

const LOOKUP_VIEW: ReaderWordGuideView = {
  mode: "lookup",
  depth: "none",
  headline: null,
  copy: null,
  compare: null,
  invitation: null,
  secondEncounter: null,
  observe: null,
  insight: null,
  understand: null,
  exampleLine: null,
  linkedWordIds: [],
};

/**
 * Assembles the Reader word guide from Pattern Catalog copy + orchestrator depth.
 * No pedagogical decisions here — only section visibility by depth.
 */
export function buildReaderWordGuide(input: {
  text: ReaderTextData;
  snapshot: ReaderWordSnapshot;
  depth: ReaderPedagogicalDepth;
  isPatternBearer: boolean;
}): ReaderWordGuideView {
  const { text, snapshot, depth, isPatternBearer } = input;

  if (!isPatternBearer || depth === "none") {
    return LOOKUP_VIEW;
  }

  const resolved = resolveSentencePattern(text, snapshot.sentenceId);
  if (!resolved) {
    return LOOKUP_VIEW;
  }

  const currentForm = displayForm(snapshot);
  const prior = findPriorFormInText(text, snapshot);
  const linkedWordIds = [snapshot.id];
  if (prior) {
    linkedWordIds.push(prior.wordId);
  }

  const sentence = text.sentences.find((s) => s.id === snapshot.sentenceId);
  const { pattern } = resolved;
  const copy = pattern.guide;

  return {
    mode: "guide",
    depth,
    headline: resolveGuideHeadline(copy, currentForm),
    copy,
    compare: {
      priorForm: prior?.form ?? null,
      currentForm,
    },
    invitation: depth === "notice" ? copy.noticeInvitation : null,
    secondEncounter: depth === "reminder" ? copy.secondEncounter : null,
    observe: isDepthAtLeast(depth, "observe") ? pattern.observation : null,
    insight: isDepthAtLeast(depth, "insight") ? pattern.insight : null,
    understand: isDepthAtLeast(depth, "understand") ? pattern.comprehension : null,
    exampleLine: isDepthAtLeast(depth, "insight") ? (sentence?.russianText ?? null) : null,
    linkedWordIds,
  };
}
