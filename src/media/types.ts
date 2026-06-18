/**
 * Rossiyani Media Layer — domain types.
 *
 * Product modules (Reader, Explorer, Practice, Manual, Library, Dashboard)
 * must consume MediaAsset only. They must never reference file paths or storage backends.
 */

/** Supported media kinds today; extend when video / generated assets ship. */
export type MediaKind = "image" | "illustration" | "audio" | "video";

/**
 * Storage / delivery backend identifier.
 * New backends are added here without changing product-facing MediaAsset shape.
 */
export type MediaBackend =
  | "local-public"
  | "supabase"
  | "r2"
  | "s3"
  | "cdn"
  | "generated";

/** How a resolved asset is delivered to the client. */
export type MediaDelivery = {
  backend: MediaBackend;
  /** Browser-ready URL (relative or absolute). */
  url: string;
  mimeType?: string;
  /** Optional named variants (thumbnail, full, webp, etc.). */
  variants?: Record<string, string>;
};

/**
 * Product-facing media reference.
 * Resolved at runtime by the Media Layer from a stable catalog id.
 */
export type MediaAsset = {
  id: string;
  kind: MediaKind;
  alt: string;
  label?: string;
  width?: number;
  height?: number;
  delivery: MediaDelivery;
};

/** Internal catalog record — never exported to product modules. */
export type MediaCatalogEntry = {
  id: string;
  kind: MediaKind;
  alt: string;
  label?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  /** Local-public relative path under /public (media layer internal). */
  localPublicPath?: string;
};
