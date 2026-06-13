import { describe, expect, it } from "vitest";

import { buildSentenceDisplay } from "@/lib/formatting/build-sentence-display";

describe("buildSentenceDisplay", () => {
  it("renders punctuation outside word tokens", () => {
    const segments = buildSentenceDisplay("У меня есть брат.", [
      { position: 0, original: "У" },
      { position: 1, original: "меня" },
      { position: 2, original: "есть" },
      { position: 3, original: "брат" },
    ]);
    const types = segments.map((s) => s.type);
    expect(types).toContain("punctuation");
    expect(types.filter((t) => t === "word")).toHaveLength(4);
  });

  it("keeps unmatched analyzed words as clickable segments", () => {
    const segments = buildSentenceDisplay("Привет мир.", [
      { position: 0, original: "Привет" },
      { position: 1, original: "мир" },
    ]);
    expect(segments.some((s) => s.type === "word" && s.text === "мир")).toBe(true);
  });

  it("surfaces orphan cyrillic tokens from gaps", () => {
    const segments = buildSentenceDisplay("Привет менусуровизмимним.", [
      { position: 0, original: "Привет" },
    ]);
    expect(
      segments.some((s) => s.type === "word" && s.text === "менусуровизмимним"),
    ).toBe(true);
  });
});
