import { describe, expect, it } from "vitest";

import {
  analyzePastedText,
  buildSessionReport,
  createPendingFromPaste,
  detectLevelFromFileName,
  formatFileSize,
  hasImportText,
  isImportTitleValid,
  titleFromFileName,
  titleFromPaste,
  type ImportQueueItem,
} from "@/lib/import-client";

describe("import-client helpers", () => {
  it("checks non-empty text", () => {
    expect(hasImportText("Hello world")).toBe(true);
    expect(hasImportText("Привет мир.")).toBe(true);
    expect(hasImportText("   ")).toBe(false);
  });

  it("analyzes pasted text stats", () => {
    const stats = analyzePastedText("Hello. How are you?");
    expect(stats.characters).toBeGreaterThan(0);
    expect(stats.words).toBeGreaterThan(0);
    expect(stats.estimatedSentences).toBeGreaterThan(0);
    expect(stats.estimatedReadingMinutes).toBeGreaterThan(0);
  });

  it("creates pending import from paste", () => {
    const pending = createPendingFromPaste("Hello world.", "B1", {
      title: "Mon titre",
      source: "Wikipedia",
    });
    expect(pending.fileName).toBe("texte-collé.txt");
    expect(pending.title).toBe("Mon titre");
    expect(pending.source).toBe("Wikipedia");
    expect(pending.level).toBe("B1");
    expect(pending.estimatedSentences).toBeGreaterThan(0);
  });

  it("validates import title", () => {
    expect(isImportTitleValid("L'hiver en Russie")).toBe(true);
    expect(isImportTitleValid("   ")).toBe(false);
  });

  it("derives title from pasted text using first sentence or fallback", () => {
    expect(titleFromPaste("")).toBe("Nouveau texte");
    expect(titleFromPaste("Hello world")).toContain("Hello");
  });

  it("derives title from file name", () => {
    expect(titleFromFileName("mon_texte-russe.txt")).toBe("mon texte russe");
    expect(titleFromFileName("article.pdf")).toBe("article");
  });

  it("detects CEFR level from file name", () => {
    expect(detectLevelFromFileName("A2_dialogue.txt")).toBe("A2");
    expect(detectLevelFromFileName("article-B1.md")).toBe("B1");
    expect(detectLevelFromFileName("plain.txt")).toBeNull();
  });

  it("formats file sizes", () => {
    expect(formatFileSize(512)).toBe("512 o");
    expect(formatFileSize(2048)).toBe("2.0 Ko");
    expect(formatFileSize(1_048_576)).toBe("1.0 Mo");
  });

  it("aggregates lexical quality in session report", () => {
    const item = {
      id: "1",
      fileName: "test.txt",
      title: "Test",
      source: "",
      rawText: "Привет",
      level: "A2",
      estimatedSentences: 1,
      fileSizeBytes: 10,
      detectedLevel: null,
      status: "completed",
      progress: 100,
      sentencesProcessed: 1,
      knowledgeHits: 0,
      aiCalls: 1,
      etaSeconds: null,
      result: {
        textId: "t1",
        sentenceCount: 1,
        wordCount: 2,
        phraseGroupCount: 0,
        sentencesNeedingReview: 0,
        warnings: [],
        qualityReport: {
          tokens: [
            {
              surface: "Привет",
              normalized: "привет",
              status: "KNOWN",
              confidence: 80,
              reasons: [],
              suggestion: null,
              frequency: 1,
            },
            {
              surface: "менусуровизмимним",
              normalized: "менусуровизмимним",
              status: "SUSPICIOUS",
              confidence: 15,
              reasons: ["Longueur inhabituelle"],
              suggestion: null,
              frequency: 1,
            },
          ],
          knownCount: 1,
          unknownCount: 0,
          suspiciousCount: 1,
          invalidCount: 0,
          invalidSurfaces: [],
        },
      },
    } satisfies ImportQueueItem;

    const report = buildSessionReport([item], null, null);
    expect(report.quality?.knownWords).toBe(1);
    expect(report.quality?.suspiciousWords).toBe(1);
    expect(report.quality?.suspiciousTokens).toHaveLength(1);
    expect(report.quality?.suspiciousTokens[0]?.word).toBe("менусуровизмимним");
  });

  it("aggregates segment stats in session report", () => {
    const item = {
      id: "2",
      fileName: "song.txt",
      title: "Song",
      source: "",
      rawText: "Строка 1\nСтрока 2",
      level: "A2",
      estimatedSentences: 2,
      fileSizeBytes: 20,
      detectedLevel: null,
      status: "completed",
      progress: 100,
      sentencesProcessed: 2,
      knowledgeHits: 0,
      aiCalls: 2,
      etaSeconds: null,
      result: {
        textId: "t2",
        sentenceCount: 2,
        wordCount: 0,
        phraseGroupCount: 0,
        sentencesNeedingReview: 1,
        warnings: [],
        segmentStats: {
          total: 2,
          complete: 1,
          partial: 1,
          failed: 0,
          lost: 0,
        },
      },
    } satisfies ImportQueueItem;

    const report = buildSessionReport([item], null, null);
    expect(report.segmentStats?.total).toBe(2);
    expect(report.segmentStats?.complete).toBe(1);
    expect(report.segmentStats?.partial).toBe(1);
    expect(report.hasPartialSegments).toBe(true);
  });
});
