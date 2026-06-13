import { describe, expect, it } from "vitest";

import { validateTextTitle, TEXT_TITLE_MAX_LENGTH } from "@/features/texts/text-title-validation";

describe("validateTextTitle", () => {
  it("trims and accepts a valid title", () => {
    const result = validateTextTitle("  Mon texte  ");
    expect(result).toEqual({ ok: true, title: "Mon texte" });
  });

  it("rejects empty titles", () => {
    const result = validateTextTitle("   ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("obligatoire");
    }
  });

  it("rejects titles longer than the max length", () => {
    const result = validateTextTitle("a".repeat(TEXT_TITLE_MAX_LENGTH + 1));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain(String(TEXT_TITLE_MAX_LENGTH));
    }
  });
});
