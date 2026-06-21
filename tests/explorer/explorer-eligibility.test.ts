import { describe, expect, it } from "vitest";

import {
  isConceptExplorerEligible,
  isPhraseExplorerEligible,
} from "@/features/explorer/entity/explorer-eligibility";

describe("explorer eligibility", () => {
  it("accepts idiomatic fixed expressions", () => {
    expect(isPhraseExplorerEligible("делать вид", "FIXED_EXPRESSION")).toBe(true);
    expect(isPhraseExplorerEligible("несмотря на", "FIXED_EXPRESSION")).toBe(true);
    expect(isPhraseExplorerEligible("как дела?", "FIXED_EXPRESSION")).toBe(true);
  });

  it("rejects full sentences and arbitrary SVO chunks", () => {
    expect(isPhraseExplorerEligible("Он сидит тихо.", "NATIVE_CONSTRUCTION")).toBe(false);
    expect(isPhraseExplorerEligible("он сидит тихо", "NATIVE_CONSTRUCTION")).toBe(false);
    expect(isPhraseExplorerEligible("я люблю кофе", "COLLOCATION")).toBe(false);
  });

  it("rejects overly long phrase labels", () => {
    expect(
      isPhraseExplorerEligible(
        "это очень длинная фраза которая выглядит как предложение целиком",
        "FIXED_EXPRESSION",
      ),
    ).toBe(false);
  });

  it("routes case concepts to Cases, not Concepts", () => {
    expect(isConceptExplorerEligible("case:accusative", "Accusative case", "GRAMMATICAL_CASE")).toBe(
      false,
    );
    expect(
      isConceptExplorerEligible(
        "native_construction:он сидит тихо",
        "он сидит тихо",
        "CONSTRUCTION",
      ),
    ).toBe(false);
    expect(
      isConceptExplorerEligible(
        "native_construction:я люблю кофе",
        "я люблю кофе",
        "CONSTRUCTION",
      ),
    ).toBe(false);
  });
});
