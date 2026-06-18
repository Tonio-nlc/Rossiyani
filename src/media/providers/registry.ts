import type { MediaBackend } from "@/media/types";

import { localPublicMediaProvider } from "./local-public-provider";
import type { MediaProvider, MediaProviderRegistry } from "./types";

const PROVIDERS: Partial<Record<MediaBackend, MediaProvider>> = {
  "local-public": localPublicMediaProvider,
};

function readConfiguredBackend(): MediaBackend {
  const raw = process.env.MEDIA_BACKEND?.trim();
  if (raw && raw in PROVIDERS) {
    return raw as MediaBackend;
  }
  return "local-public";
}

export const mediaProviderRegistry: MediaProviderRegistry = {
  get(backend: MediaBackend): MediaProvider | null {
    return PROVIDERS[backend] ?? null;
  },

  getDefault(): MediaProvider {
    const backend = readConfiguredBackend();
    return PROVIDERS[backend] ?? localPublicMediaProvider;
  },
};
