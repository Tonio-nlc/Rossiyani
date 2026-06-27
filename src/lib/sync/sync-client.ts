import { applyUserSyncPayload } from "@/lib/sync/local-data";
import type { UserSyncState } from "@/lib/sync/types";

export async function pullUserSyncState(): Promise<{
  state: UserSyncState | null;
}> {
  const response = await fetch("/api/user/sync");
  if (!response.ok) {
    throw new Error("Impossible de charger vos données.");
  }
  return (await response.json()) as { state: UserSyncState | null };
}

export async function pushUserSyncState(input?: {
  mergeLocal?: boolean;
}): Promise<UserSyncState> {
  const response = await fetch("/api/user/sync", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mergeLocal: input?.mergeLocal ?? true }),
  });
  if (!response.ok) {
    throw new Error("Échec de la synchronisation.");
  }
  const data = (await response.json()) as { state: UserSyncState };
  applyUserSyncPayload(data.state);
  return data.state;
}
