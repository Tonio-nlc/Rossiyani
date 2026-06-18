import { describe, expect, it } from "vitest";

import {
  DEFAULT_COLLECTION_ID,
  getAllCollections,
  getCollectionById,
  getCollectionName,
  inferCollectionFromImportHints,
  isCollectionId,
  resolveCollectionIdFromLegacySource,
  resolveTextCollectionId,
} from "@/content/collections";

describe("content/collections", () => {
  it("lists collections in display order", () => {
    const collections = getAllCollections();
    expect(collections.length).toBe(7);
    expect(collections[0]?.id).toBe("everyday-russian");
    expect(collections.at(-1)?.id).toBe("culture");
  });

  it("resolves collection names", () => {
    expect(getCollectionName("telegram")).toBe("Telegram");
    expect(getCollectionById("stories").name).toBe("Russian Stories");
  });

  it("maps legacy source strings to collection ids", () => {
    expect(resolveCollectionIdFromLegacySource("Everyday Russian")).toBe("everyday-russian");
    expect(resolveCollectionIdFromLegacySource("Telegram channel")).toBe("telegram");
    expect(resolveCollectionIdFromLegacySource("Slow News")).toBe("slow-news");
    expect(resolveCollectionIdFromLegacySource("")).toBe(DEFAULT_COLLECTION_ID);
  });

  it("prefers persisted collectionId over legacy source", () => {
    expect(
      resolveTextCollectionId({
        collectionId: "culture",
        source: "Wikipedia",
      }),
    ).toBe("culture");
  });

  it("infers collection from import hints", () => {
    expect(
      inferCollectionFromImportHints({
        source: "Russian Stories",
        category: null,
        fileName: "hello.txt",
      }),
    ).toBe("stories");
  });

  it("validates collection ids", () => {
    expect(isCollectionId("dialogues")).toBe(true);
    expect(isCollectionId("wikipedia")).toBe(false);
  });
});
