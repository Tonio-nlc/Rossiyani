import type { MediaBackend, MediaCatalogEntry, MediaDelivery } from "@/media/types";

/** Contract for a storage / delivery backend. */
export type MediaProvider = {
  readonly backend: MediaBackend;
  resolve(entry: MediaCatalogEntry): MediaDelivery | null;
};

export type MediaProviderRegistry = {
  get(backend: MediaBackend): MediaProvider | null;
  getDefault(): MediaProvider;
};
