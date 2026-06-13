import { describe, expect, it } from "vitest";

import {
  conceptLookupKey,
  prepositionPatternKey,
} from "@/lib/normalization/russian-key";

describe("concept lookup keys", () => {
  it("normalizes concept keys", () => {
    expect(conceptLookupKey("Prepositional case")).toBe("prepositional_case");
    expect(conceptLookupKey("  в + prepositional  ")).toBe("в_+_prepositional");
  });

  it("builds preposition pattern keys", () => {
    expect(prepositionPatternKey("в", "prepositional")).toBe("в_prepositional");
    expect(prepositionPatternKey("на", "prepositional")).toBe("на_prepositional");
  });
});
