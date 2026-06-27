import { describe, expect, it } from "vitest";

import { pickFirstOnboardingText } from "@/lib/onboarding/pick-first-text";
import type { TextListItem } from "@/features/texts";

function text(id: string, level: TextListItem["level"], sentenceCount: number): TextListItem {
  return {
    id,
    title: `Texte ${id}`,
    level,
    collectionId: "classic",
    categoryIds: [],
    createdAt: new Date("2026-01-01"),
    sentenceCount,
  };
}

describe("pickFirstOnboardingText", () => {
  const texts = [
    text("a1-long", "A1", 40),
    text("a1-short", "A1", 8),
    text("a2", "A2", 15),
    text("b1", "B1", 20),
  ];

  it("picks the shortest A1 text for beginners", () => {
    expect(pickFirstOnboardingText(texts, "beginner")?.id).toBe("a1-short");
  });

  it("prefers A2/B1 for intermediate learners", () => {
    expect(pickFirstOnboardingText(texts, "intermediate")?.id).toBe("a2");
  });

  it("falls back when no exact level match exists", () => {
    const onlyB1 = [text("b1-only", "B1", 12)];
    expect(pickFirstOnboardingText(onlyB1, "beginner")?.id).toBe("b1-only");
  });
});
