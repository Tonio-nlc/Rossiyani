import { describe, expect, it } from "vitest";

import { buildReaderWordGuide } from "@/lib/reader/build-reader-word-guide";
import { mapDecisionToReaderDepth } from "@/services/learning-orchestrator/map-to-reader";
import type { ReaderWordSnapshot } from "@/lib/reader/build-minimal-word-detail";
import type { ReaderTextData } from "@/features/texts";
import type { ReaderPatternGuideCopy } from "@/types/reader-pattern-experience";

const guideCopy: ReaderPatternGuideCopy = {
  headlineWithAnchor: "Pourquoi « {{anchor}} » s'écrit ainsi ?",
  headlineDefault: "Pourquoi la même idée change de forme ?",
  noticeLead: "Regarde simplement.",
  comparePriorLabel: "Tu as déjà vu",
  compareCurrentLabel: "Aujourd'hui tu lis",
  noticeInvitation: "Regarde cette différence.",
  secondEncounter: "Tu as déjà rencontré cette différence. Observe-la.",
  exampleLabel: "Dans cette phrase",
};

function minimalText(): ReaderTextData {
  return {
    id: "text-a1-family-01",
    title: "Моя семья",
    collectionId: "a1-foundation-pack",
    level: "A1",
    sentences: [
      {
        id: "s1",
        position: 1,
        russianText: "У меня есть сестра.",
        literalTranslation: "",
        naturalTranslation: "",
        analysisState: "ready",
        words: [
          {
            id: "w-sistra",
            position: 3,
            original: "сестра",
            stressMarked: "сестра",
            stem: "",
            ending: "",
            partOfSpeech: "noun",
            case: null,
            lemma: "сестра",
            explanation: "",
            formId: null,
          },
        ],
      },
      {
        id: "s2",
        position: 2,
        russianText: "У моей сестры есть кот.",
        literalTranslation: "",
        naturalTranslation: "",
        analysisState: "ready",
        words: [
          {
            id: "w-sestry",
            position: 2,
            original: "сестры",
            stressMarked: "сестры",
            stem: "",
            ending: "",
            partOfSpeech: "noun",
            case: null,
            lemma: "сестра",
            explanation: "",
            formId: null,
          },
        ],
      },
    ],
    patternSlice: {
      patterns: {
        "lp.morphology.role_terminations.v1": {
          id: "lp.morphology.role_terminations.v1",
          userFacingName: "Les mots changent selon leur rôle",
          observation: "Les terminaisons changent selon le rôle du nom.",
          insight:
            "Ces terminaisons signalent le rôle du mot — comme des étiquettes.",
          comprehension: "« сестра » et « сестры » ne sont pas interchangeables.",
          guide: guideCopy,
        },
      },
      bySentenceId: {
        s2: {
          primaryPatternId: "lp.morphology.role_terminations.v1",
          instance: {
            span: { startPosition: 1, endPosition: 3 },
            triggeringTokens: [2],
            salience: 0.9,
            confidence: 0.85,
          },
          secondaryPatternIds: [],
        },
      },
    },
  } as ReaderTextData;
}

function snapshot(): ReaderWordSnapshot {
  return {
    id: "w-sestry",
    sentenceId: "s2",
    textId: "text-a1-family-01",
    position: 2,
    original: "сестры",
    stressMarked: "сестры",
    stem: "",
    ending: "",
    partOfSpeech: "noun",
    case: null,
    lemma: "сестра",
    isProperNoun: null,
    explanation: "",
    gender: null,
    number: null,
    tense: null,
    aspect: null,
    formId: null,
    literalTranslation: "",
    naturalTranslation: "",
  };
}

describe("mapDecisionToReaderDepth", () => {
  it("maps SILENCE on bearer to notice depth", () => {
    expect(
      mapDecisionToReaderDepth(
        {
          action: "SILENCE",
          patternId: "lp.morphology.role_terminations.v1",
          primaryPatternId: "lp.morphology.role_terminations.v1",
          deferredPatternIds: [],
          depthLevels: [],
          showEcho: false,
          suppressLegacyGrammar: true,
          reminder: null,
          softMessage: null,
          reasons: [],
        },
        { isPatternBearer: true },
      ),
    ).toBe("notice");
  });

  it("maps INSIGHT with L3 to understand", () => {
    expect(
      mapDecisionToReaderDepth(
        {
          action: "INSIGHT",
          patternId: "lp.morphology.role_terminations.v1",
          primaryPatternId: "lp.morphology.role_terminations.v1",
          deferredPatternIds: [],
          depthLevels: ["L1", "L2", "L3"],
          showEcho: false,
          suppressLegacyGrammar: true,
          reminder: null,
          softMessage: null,
          reasons: [],
        },
        { isPatternBearer: true },
      ),
    ).toBe("understand");
  });
});

describe("buildReaderWordGuide", () => {
  it("shows comparison only at notice depth", () => {
    const guide = buildReaderWordGuide({
      text: minimalText(),
      snapshot: snapshot(),
      depth: "notice",
      isPatternBearer: true,
    });

    expect(guide.mode).toBe("guide");
    expect(guide.headline).toContain("сестры");
    expect(guide.compare?.priorForm).toBe("сестра");
    expect(guide.invitation).toBeTruthy();
    expect(guide.observe).toBeNull();
    expect(guide.insight).toBeNull();
  });

  it("reveals observation at observe depth", () => {
    const guide = buildReaderWordGuide({
      text: minimalText(),
      snapshot: snapshot(),
      depth: "observe",
      isPatternBearer: true,
    });

    expect(guide.observe).toContain("rôle");
    expect(guide.insight).toBeNull();
  });

  it("reveals insight at insight depth", () => {
    const guide = buildReaderWordGuide({
      text: minimalText(),
      snapshot: snapshot(),
      depth: "insight",
      isPatternBearer: true,
    });

    expect(guide.observe).toBeTruthy();
    expect(guide.insight).toContain("étiquettes");
    expect(guide.exampleLine).toBeTruthy();
  });

  it("lookup mode for non-bearer words", () => {
    const guide = buildReaderWordGuide({
      text: minimalText(),
      snapshot: snapshot(),
      depth: "insight",
      isPatternBearer: false,
    });

    expect(guide.mode).toBe("lookup");
  });
});
