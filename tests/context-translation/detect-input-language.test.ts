import { describe, expect, it } from "vitest";

import { detectInputLanguage } from "@/lib/context-translation/detect-input-language";

describe("detectInputLanguage", () => {
  it("detects French", () => {
    expect(detectInputLanguage("On est foutu.")).toBe("fr");
  });

  it("detects English", () => {
    expect(detectInputLanguage("We're running late.")).toBe("en");
  });

  it("detects Russian", () => {
    expect(detectInputLanguage("Мы сломаны.")).toBe("ru");
  });
});
