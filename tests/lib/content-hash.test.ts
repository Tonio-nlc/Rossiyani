import { describe, expect, it } from "vitest";

import { computeContentHash } from "@/lib/hash/content-hash";

describe("computeContentHash", () => {
  it("produces stable hashes for equivalent text", () => {
    const a = computeContentHash("  Таяла зима.\n");
    const b = computeContentHash("Таяла зима.");
    expect(a).toBe(b);
  });

  it("differs for different content", () => {
    const a = computeContentHash("Таяла зима.");
    const b = computeContentHash("Пришла весна.");
    expect(a).not.toBe(b);
  });
});
