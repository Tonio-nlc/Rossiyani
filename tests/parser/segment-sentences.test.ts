import { describe, expect, it } from "vitest";

import { segmentSentences } from "@/services/parser/segment-sentences";

describe("segmentSentences", () => {
  it("splits on sentence-ending punctuation", () => {
    const result = segmentSentences("Вчера я ходил в магазин. Потом встретил друга.");
    expect(result).toEqual([
      "Вчера я ходил в магазин.",
      "Потом встретил друга.",
    ]);
  });

  it("handles paragraph breaks", () => {
    const result = segmentSentences("Первая фраза.\n\nВторая фраза.");
    expect(result).toHaveLength(2);
  });

  it("segments lyrics by line", () => {
    const lyrics = [
      "Я иду по улице",
      "Смотрю на огни",
      "Город не спит",
      "Ночь впереди",
    ].join("\n");
    const result = segmentSentences(lyrics);
    expect(result.length).toBeGreaterThanOrEqual(4);
  });

  it("chunks very long segments", () => {
    const long = `${"Это очень длинное предложение без точки ".repeat(15)}.`;
    const result = segmentSentences(long);
    expect(result.length).toBeGreaterThan(1);
    expect(result.every((s) => s.length <= 350)).toBe(true);
  });

  it("returns empty array for empty input", () => {
    expect(segmentSentences("   ")).toEqual([]);
  });
});
