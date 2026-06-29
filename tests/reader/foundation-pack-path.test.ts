import { describe, expect, it } from "vitest";

import { getNextFoundationTextId } from "@/lib/reader/foundation-pack-path";
import { buildReadingSessionSummary } from "@/lib/reader/build-reading-session-summary";
import type { ReaderTextData } from "@/features/texts";

function minimalText(id: string, title: string): ReaderTextData {
  return {
    id,
    title,
    level: "A1",
    collectionId: "everyday-russian",
    categoryIds: [],
    patternSlice: { patterns: {}, bySentenceId: {} },
    sentences: [],
  };
}

describe("Foundation pack navigation", () => {
  it("links intro to family on completion", () => {
    const summary = buildReadingSessionSummary(minimalText("text-a1-intro-01", "Привет!"), []);
    expect(summary.continueActions[0]?.href).toBe("/texts/text-a1-family-01");
    expect(summary.continueActions[0]?.label).toMatch(/suivant/i);
  });

  it("links family to home", () => {
    expect(getNextFoundationTextId("text-a1-family-01")).toBe("text-a1-home-01");
  });
});
