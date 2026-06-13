import { describe, expect, it } from "vitest";

import {
  classifyToken,
  classifyTokenHeuristic,
  isReaderSuspiciousWord,
} from "@/services/import-quality/classify-token";
import { findClosestKnownForm } from "@/services/import-quality/levenshtein";
import type { ClassifyTokenContext } from "@/services/import-quality/classify-token";

const emptyCtx: ClassifyTokenContext = {
  knownFormKeys: new Set(),
  knownLemmaKeys: new Set(),
  knownFormSurfaces: [],
  frequency: 1,
};

describe("import-quality classify-token", () => {
  it("classifies common Russian words from internal lexicon as KNOWN", () => {
    expect(classifyToken("Россия", emptyCtx).status).toBe("KNOWN");
    expect(classifyToken("и", { ...emptyCtx, frequency: 2 }).status).toBe("KNOWN");
  });

  it("classifies plausible unknown inflected forms as UNKNOWN", () => {
    expect(classifyToken("морозными", emptyCtx).status).toBe("UNKNOWN");
    expect(classifyToken("деревьях", emptyCtx).status).toBe("UNKNOWN");
  });

  it("classifies corrupted long tokens as SUSPICIOUS", () => {
    const entry = classifyToken("менусуровизмимним", emptyCtx);
    expect(entry.status).toBe("SUSPICIOUS");
    expect(entry.reasons.length).toBeGreaterThan(0);
  });

  it("classifies non-Cyrillic garbage as INVALID", () => {
    expect(classifyTokenHeuristic("asdfasdfasdf")).toBe("INVALID");
  });

  it("suggests closest known form for near-miss tokens", () => {
    const suggestion = findClosestKnownForm("морознимы", ["морозными", "морозный"]);
    expect(suggestion).toBe("морозными");
  });

  it("detects reader suspicious words via explanation mark or heuristic", () => {
    expect(
      isReaderSuspiciousWord("дерево", "[rossiyani:suspicious] forme douteuse", null),
    ).toBe(true);
    expect(isReaderSuspiciousWord("Россия", "nom propre", "form-id")).toBe(false);
    expect(isReaderSuspiciousWord("менусуровизмимним", "", null)).toBe(true);
  });
});
