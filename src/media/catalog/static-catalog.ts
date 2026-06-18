import type { MediaCatalogEntry } from "@/media/types";

/**
 * Static media catalog.
 *
 * All known assets are registered here by stable id.
 * Physical paths live only in this file — never in product components.
 *
 * Future: hydrate from CMS / DB while preserving the same ids.
 */
export const STATIC_MEDIA_CATALOG = {
  "dashboard.hero": {
    id: "dashboard.hero",
    kind: "illustration",
    alt: "",
    label: "Dashboard hero illustration",
    width: 2338,
    height: 1474,
    mimeType: "image/png",
    localPublicPath: "illustrations/hero_image.png",
  },
} as const satisfies Record<string, MediaCatalogEntry>;

export type MediaAssetId = keyof typeof STATIC_MEDIA_CATALOG;

export function isMediaAssetId(value: string): value is MediaAssetId {
  return value in STATIC_MEDIA_CATALOG;
}

export function getCatalogEntry(id: MediaAssetId): MediaCatalogEntry {
  return STATIC_MEDIA_CATALOG[id];
}
