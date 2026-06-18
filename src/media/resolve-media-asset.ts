import { getCatalogEntry, type MediaAssetId } from "@/media/catalog/static-catalog";
import { mediaProviderRegistry } from "@/media/providers/registry";
import type { MediaAsset } from "@/media/types";

export class MediaResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaResolutionError";
  }
}

/**
 * Resolves a catalog id into a product-facing MediaAsset.
 * This is the only entry point product modules should use.
 */
export function resolveMediaAsset(id: MediaAssetId): MediaAsset {
  const entry = getCatalogEntry(id);
  const provider = mediaProviderRegistry.getDefault();
  const delivery = provider.resolve(entry);

  if (!delivery) {
    throw new MediaResolutionError(
      `Could not resolve media asset "${id}" with backend "${provider.backend}".`,
    );
  }

  return {
    id: entry.id,
    kind: entry.kind,
    alt: entry.alt,
    label: entry.label,
    width: entry.width,
    height: entry.height,
    delivery,
  };
}
