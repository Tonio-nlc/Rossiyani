import { describe, expect, it } from "vitest";

import {
  formLookupKey,
  phraseLookupKey,
  sentenceLookupKey,
} from "@/lib/normalization/russian-key";

describe("russian-key", () => {
  it("normalizes case for form lookup", () => {
    expect(formLookupKey("Таяла")).toBe(formLookupKey("таяла"));
  });

  it("builds stable sentence keys", () => {
    expect(sentenceLookupKey("У меня есть брат.")).toBe(
      sentenceLookupKey("У меня есть брат."),
    );
  });

  it("normalizes phrase spacing", () => {
    expect(phraseLookupKey("мне  кажется")).toBe(phraseLookupKey("мне кажется"));
  });
});
