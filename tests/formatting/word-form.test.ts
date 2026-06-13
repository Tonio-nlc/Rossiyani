import { describe, expect, it } from "vitest";

import { reconcileWordStem, wordFormMatchesOriginal } from "@/lib/formatting/word-form";

describe("wordFormMatchesOriginal", () => {
  it("accepts exact match", () => {
    expect(wordFormMatchesOriginal("городке", "городк", "е")).toBe(true);
  });

  it("accepts case mismatch on stem (Таяла = таял + а)", () => {
    expect(wordFormMatchesOriginal("Таяла", "таял", "а")).toBe(true);
  });

  it("accepts when stress marks differ in stressMarked only", () => {
    expect(wordFormMatchesOriginal("зима", "зим", "а")).toBe(true);
  });

  it("accepts morphological stem (городке = городк + е)", () => {
    expect(wordFormMatchesOriginal("городке", "городк", "е")).toBe(true);
  });

  it("rejects lemma stem that does not match surface (городок + е)", () => {
    expect(wordFormMatchesOriginal("городке", "городок", "е")).toBe(false);
  });

  it("reconcileWordStem fixes lemma-style stem", () => {
    expect(reconcileWordStem("городке", "городок", "е")).toBe("городк");
  });

  it("rejects genuinely mismatched forms", () => {
    expect(wordFormMatchesOriginal("хлебом", "хлеб", "а")).toBe(false);
  });
});
