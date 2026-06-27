import { describe, expect, it } from "vitest";

import { mergeUserSyncPayload } from "@/lib/sync/local-data";
import { EMPTY_USER_SYNC_PAYLOAD } from "@/lib/sync/types";
import { hashPassword, verifyPassword } from "@/services/auth/crypto";

describe("auth crypto", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("motdepasse-test");
    expect(await verifyPassword("motdepasse-test", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("mergeUserSyncPayload", () => {
  it("keeps the most recent reading progress and unions seen ids", () => {
    const local = {
      ...EMPTY_USER_SYNC_PAYLOAD,
      readingProgress: {
        text1: {
          textId: "text1",
          lastSentenceId: "s2",
          lastWordId: null,
          wordsSeenIds: ["w1", "w2"],
          sentencesSeenIds: ["s1", "s2"],
          totalWords: 10,
          percent: 20,
          readingTimeMs: 1000,
          lastReadAt: "2026-06-27T12:00:00.000Z",
        },
      },
    };
    const remote = {
      ...EMPTY_USER_SYNC_PAYLOAD,
      readingProgress: {
        text1: {
          textId: "text1",
          lastSentenceId: "s1",
          lastWordId: null,
          wordsSeenIds: ["w2", "w3"],
          sentencesSeenIds: ["s1"],
          totalWords: 10,
          percent: 10,
          readingTimeMs: 500,
          lastReadAt: "2026-06-26T12:00:00.000Z",
        },
      },
    };

    const merged = mergeUserSyncPayload(local, remote);
    expect(merged.readingProgress.text1?.lastSentenceId).toBe("s2");
    expect(merged.readingProgress.text1?.wordsSeenIds.sort()).toEqual(["w1", "w2", "w3"]);
    expect(merged.readingProgress.text1?.readingTimeMs).toBe(1500);
  });
});
