import type { MediaCatalogEntry, MediaDelivery } from "@/media/types";

import type { MediaProvider } from "./types";

function normalizePublicUrl(relativePath: string): string {
  const trimmed = relativePath.replace(/^\/+/, "");
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "");

  if (base) {
    return `${base}/${trimmed}`;
  }

  return `/${trimmed}`;
}

/**
 * Serves files from Next.js /public (or CDN mirror via NEXT_PUBLIC_MEDIA_BASE_URL).
 *
 * Today:  /public/illustrations/hero_image.png  →  /illustrations/hero_image.png
 * Future: /public/media/... or remote CDN without product changes.
 */
export const localPublicMediaProvider: MediaProvider = {
  backend: "local-public",

  resolve(entry: MediaCatalogEntry): MediaDelivery | null {
    if (!entry.localPublicPath) {
      return null;
    }

    return {
      backend: "local-public",
      url: normalizePublicUrl(entry.localPublicPath),
      mimeType: entry.mimeType,
    };
  },
};
