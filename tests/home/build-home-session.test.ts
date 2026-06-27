import { describe, expect, it } from "vitest";

import { pickHomeJourneyTexts } from "@/lib/home/pick-home-journey-texts";
import { resolveHomeContinueBlock } from "@/lib/home/resolve-home-continue";
import type { TextListItem } from "@/features/texts";

function text(
  id: string,
  level: TextListItem["level"],
  collectionId: TextListItem["collectionId"] = "everyday-russian",
): TextListItem {
  return {
    id,
    title: `Texte ${id}`,
    level,
    collectionId,
    categoryIds: [],
    createdAt: new Date("2026-01-01"),
    sentenceCount: 12,
  };
}

describe("resolveHomeContinueBlock", () => {
  it("suggests a starter text when nothing is in progress", () => {
    const block = resolveHomeContinueBlock([text("a1", "A1")], {});
    expect(block?.textId).toBe("a1");
    expect(block?.ctaLabel).toBe("Commencer");
    expect(block?.started).toBe(false);
  });

  it("prioritizes an in-progress text", () => {
    const block = resolveHomeContinueBlock(
      [text("a1", "A1"), text("b1", "B1")],
      {
        b1: {
          textId: "b1",
          lastSentenceId: "s1",
          lastWordId: null,
          wordsSeenIds: ["w1"],
          learnableWordsSeenIds: ["w1"],
          sentencesSeenIds: ["s1"],
          totalWords: 20,
          percent: 35,
          readingTimeMs: 1000,
          lastReadAt: "2026-06-27T12:00:00.000Z",
        },
      },
    );
    expect(block?.textId).toBe("b1");
    expect(block?.ctaLabel).toBe("Continuer");
  });
});

describe("pickHomeJourneyTexts", () => {
  it("returns up to three recommendations excluding the continue text", () => {
    const texts = [
      text("one", "A1", "everyday-russian"),
      text("two", "A1", "stories"),
      text("three", "A2", "dialogues"),
      text("four", "B1", "culture"),
    ];
    const journey = pickHomeJourneyTexts(texts, {}, "one", 3);
    expect(journey).toHaveLength(3);
    expect(journey.every((item) => item.id !== "one")).toBe(true);
  });
});
