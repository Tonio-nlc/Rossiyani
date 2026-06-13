import { describe, expect, it } from "vitest";

import { cleanText } from "@/services/parser/clean-text";

describe("cleanText", () => {
  it("collapses duplicate spaces", () => {
    expect(cleanText("Привет   мир")).toBe("Привет мир");
  });

  it("normalizes line breaks", () => {
    expect(cleanText("Одна.\r\nДве.")).toBe("Одна.\nДве.");
  });

  it("trims surrounding whitespace", () => {
    expect(cleanText("  текст  ")).toBe("текст");
  });
});
