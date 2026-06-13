import { describe, expect, it, vi } from "vitest";

import { buildMinimalAnalysis } from "@/services/ai/build-minimal-analysis";
import {
  parseAnalysisResponse,
  parseAnalysisResponseDetailed,
} from "@/services/ai/parse-analysis-response";
import { requestSentenceAnalysisWithRetry } from "@/services/ai/request-analysis";
import { parseSentenceAnalysisTolerant } from "@/services/ai/tolerant-sentence-analysis";
import { chunkSegments, SEGMENT_MAX_LENGTH } from "@/services/parser/chunk-segments";
import { detectLyricsMode } from "@/services/parser/detect-lyrics-mode";
import { segmentSentences } from "@/services/parser/segment-sentences";

const shellWithTranslations = {
  russianText: "Привет мир.",
  literalTranslation: "Salut monde.",
  naturalTranslation: "Salut le monde.",
  russianLogic: "Salutation informelle.",
  orderExplanation: "Ordre SVO.",
  nativeUsageNotes: "Courant à l'oral.",
  register: "neutral",
  difficultyScore: 2,
  words: [] as unknown[],
  phraseGroups: [] as unknown[],
  needsReview: true,
};

describe("fault-tolerant parse", () => {
  it("accepts words=[] without throwing and marks analysis as partial", () => {
    const { analysis, warnings } = parseSentenceAnalysisTolerant(shellWithTranslations, {
      fallbackRussianText: "Привет мир.",
    });

    expect(analysis.words).toEqual([]);
    expect(analysis.phraseGroups).toEqual([]);
    expect(analysis.analysisStatus).toBe("partial");
    expect(analysis.needsReview).toBe(true);
    expect(warnings.some((w) => w.includes("words"))).toBe(true);
  });

  it("parseAnalysisResponse returns persistable analysis for empty words JSON", () => {
    const result = parseAnalysisResponse(JSON.stringify(shellWithTranslations), {
      russianText: "Привет мир.",
    });

    expect(result.words).toEqual([]);
    expect(result.naturalTranslation).toBe("Salut le monde.");
    expect(result.analysisStatus).toBe("partial");
  });

  it("parseAnalysisResponseDetailed falls back on invalid JSON when russianText is known", () => {
    const result = parseAnalysisResponseDetailed("not json at all", {
      russianText: "Текст.",
    });

    expect(result.isFallback).toBe(true);
    expect(result.status).toBe("failed");
    expect(result.analysis.russianText).toBe("Текст.");
    expect(result.analysis.words).toEqual([]);
  });

  it("buildMinimalAnalysis produces schema-valid output", () => {
    const analysis = buildMinimalAnalysis({
      russianText: "Длинный текст без analyse.",
      status: "partial",
      reason: "Test",
      partial: {
        naturalTranslation: "Traduction disponible.",
      },
    });

    expect(analysis.russianText).toBe("Длинный текст без analyse.");
    expect(analysis.naturalTranslation).toBe("Traduction disponible.");
    expect(analysis.words).toEqual([]);
    expect(analysis.analysisStatus).toBe("partial");
  });
});

describe("fault-tolerant AI retry", () => {
  it("retries when words=[] and no usable translations then accepts partial analysis", async () => {
    const emptyPayload = JSON.stringify({
      ...shellWithTranslations,
      naturalTranslation: "Traduction naturelle indisponible pour ce segment.",
      literalTranslation: "Traduction mot à mot indisponible pour ce segment.",
    });
    const callModel = vi
      .fn()
      .mockResolvedValueOnce(emptyPayload)
      .mockResolvedValueOnce(emptyPayload)
      .mockResolvedValueOnce(emptyPayload);

    const result = await requestSentenceAnalysisWithRetry(
      { russianText: "Привет мир." },
      {
        apiKey: "test",
        model: "test",
        callModel,
      },
    );

    expect(callModel).toHaveBeenCalledTimes(3);
    expect(result.retryCount).toBe(2);
    expect(result.analysis.words).toEqual([]);
    expect(result.status).toMatch(/partial|failed/);
    expect(result.analysis.russianText).toBe("Привет мир.");
  });

  it("stops retrying when translations are usable even with empty words", async () => {
    const payload = JSON.stringify(shellWithTranslations);
    const callModel = vi.fn().mockResolvedValueOnce(payload);

    const result = await requestSentenceAnalysisWithRetry(
      { russianText: "Привет мир." },
      {
        apiKey: "test",
        model: "test",
        callModel,
      },
    );

    expect(callModel).toHaveBeenCalledTimes(1);
    expect(result.analysis.naturalTranslation).toBe("Salut le monde.");
    expect(result.status).toBe("partial");
  });
});

describe("intelligent segmentation", () => {
  it("detects lyrics mode for multi-line short verses", () => {
    const lyrics = [
      "Я иду по улице",
      "Смотрю на огни",
      "Город не спит",
      "Ночь впереди",
      "Сердце стучит",
    ].join("\n");

    expect(detectLyricsMode(lyrics)).toBe(true);
    const segments = segmentSentences(lyrics);
    expect(segments.length).toBeGreaterThanOrEqual(5);
    expect(segments.every((s) => s.length <= SEGMENT_MAX_LENGTH)).toBe(true);
  });

  it("chunks long prose under max length", () => {
    const longSentence = "Слово ".repeat(120).trim() + ".";
    const chunks = chunkSegments([longSentence]);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.length <= SEGMENT_MAX_LENGTH)).toBe(true);
  });

  it("splits long pasted text into multiple segments", () => {
    const longText = `${"Это предложение довольно длинное и содержит много слов. ".repeat(8)}`.trim();
    const segments = segmentSentences(longText);

    expect(segments.length).toBeGreaterThan(1);
    expect(segments.every((s) => s.length <= SEGMENT_MAX_LENGTH)).toBe(true);
  });
});
