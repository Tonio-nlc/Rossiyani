import { describe, expect, it } from "vitest";

import { sanitizeSentenceText } from "@/services/import-quality/tokenize-russian";

describe("sanitizeSentenceText", () => {
  it("removes invalid cyrillic token surfaces while keeping punctuation", () => {
    const result = sanitizeSentenceText("Привет, менусуровизмимним мир!", [
      "менусуровизмимним",
    ]);
    expect(result).toBe("Привет, мир!");
  });

  it("returns sentence unchanged when no invalid surfaces", () => {
    const sentence = "Россия — большая страна.";
    expect(sanitizeSentenceText(sentence, [])).toBe(sentence);
  });
});
