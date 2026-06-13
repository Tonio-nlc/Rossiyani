import { describe, expect, it } from "vitest";

import { normalizeSearchText } from "@/lib/reader/normalize-search-text";

describe("normalizeSearchText", () => {
  it("lowercases and trims", () => {
    expect(normalizeSearchText("  Bonjour  ")).toBe("bonjour");
  });

  it("strips accents", () => {
    expect(normalizeSearchText("Éléphant")).toBe("elephant");
    expect(normalizeSearchText("café")).toBe("cafe");
  });

  it("handles cyrillic unchanged except case", () => {
    expect(normalizeSearchText("Яблоко")).toBe("яблоко");
  });
});
