import { describe, expect, it } from "vitest";

import { mergeBrokenLines } from "@/services/import/parsers/merge-broken-lines";
import { normalizeImportDocument } from "@/services/import/parsers/extract-import-metadata";
import { removePdfArtifacts } from "@/services/import/parsers/remove-pdf-artifacts";
import { normalizeQuotes } from "@/services/import/parsers/normalize-quotes";
import { parseMd } from "@/services/import/parsers/parse-md";
import { parseTxt } from "@/services/import/parsers/parse-txt";
import { segmentSentences } from "@/services/parser/segment-sentences";

describe("import parsers", () => {
  it("mergeBrokenLines joins comma continuations", () => {
    const input = "Привет,\nкак дела?";
    expect(mergeBrokenLines(input)).toBe("Привет, как дела?");
  });

  it("mergeBrokenLines joins hyphenated word breaks", () => {
    const input = "слово-\nобразование";
    expect(mergeBrokenLines(input)).toBe("словообразование");
  });

  it("removePdfArtifacts strips repeated headers and page numbers", () => {
    const pages = [
      "Lesson 2\nПривет мир.\nPage 1\nwww.example.com",
      "Lesson 2\nКак дела?\nPage 2\nwww.example.com",
      "Lesson 2\nХорошо.\nPage 3\nwww.example.com",
    ];
    const cleaned = removePdfArtifacts(pages);
    expect(cleaned).not.toContain("Page 1");
    expect(cleaned).not.toContain("www.example.com");
    expect(cleaned).toContain("Привет мир.");
    expect(cleaned).toContain("Как дела?");
  });

  it("normalizeQuotes standardizes smart quotes", () => {
    expect(normalizeQuotes("\u201Chello\u201D")).toBe('"hello"');
    expect(normalizeQuotes("«привет»")).toBe("«привет»");
  });

  it("normalizeImportDocument preserves paragraphs and estimates metadata", () => {
    const raw = "Привет, мир.\n\nКак дела? Всё хорошо.";
    const { text, metadata } = normalizeImportDocument(raw, {
      sourceType: "txt",
      fileName: "B1_dialogue.txt",
    });
    expect(text).toContain("Привет, мир.");
    expect(metadata.estimatedSentences).toBeGreaterThan(0);
    expect(metadata.detectedLevel).toBe("B1");
    expect(metadata.estimatedReadingMinutes).toBeGreaterThan(0);
  });

  it("parseTxt produces normalized document", () => {
    const doc = parseTxt("Один. Два.", "sample.txt");
    expect(doc.sourceType).toBe("txt");
    expect(doc.rawText).toContain("Один.");
    expect(segmentSentences(doc.rawText).length).toBeGreaterThan(0);
  });

  it("parseMd strips markdown formatting", () => {
    const doc = parseMd("# Заголовок\n\n**Жирный** текст.", "lesson.md");
    expect(doc.rawText).not.toContain("#");
    expect(doc.rawText).not.toContain("**");
    expect(doc.rawText).toContain("Жирный");
  });
});
