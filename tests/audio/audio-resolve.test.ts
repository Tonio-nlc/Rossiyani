import { describe, expect, it } from "vitest";

import { hashAudioContent } from "@/services/audio/content-hash";
import { isAudioFallback } from "@/services/audio/types";

describe("hashAudioContent", () => {
  it("returns a stable hash for the same text and voice", () => {
    const first = hashAudioContent("Привет", "ru-svetlana");
    const second = hashAudioContent("Привет", "ru-svetlana");
    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(16);
  });

  it("changes when voice changes", () => {
    const first = hashAudioContent("Привет", "ru-svetlana");
    const second = hashAudioContent("Привет", "ru-other");
    expect(first).not.toBe(second);
  });
});

describe("isAudioFallback", () => {
  it("detects fallback payloads", () => {
    expect(
      isAudioFallback({
        fallback: true,
        text: "Привет",
        lang: "ru-RU",
      }),
    ).toBe(true);
  });

  it("rejects clip payloads", () => {
    expect(
      isAudioFallback({
        url: "/media/audio/cache/abc.mp3",
        mimeType: "audio/mpeg",
        provider: "azure",
        cached: true,
      }),
    ).toBe(false);
  });
});
