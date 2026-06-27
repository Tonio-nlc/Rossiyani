import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthResponse, requireAuthSession } from "@/lib/auth/require-session";
import {
  collectLocalUserSyncPayload,
  hasLocalUserData,
  isUserSyncPayloadEmpty,
  mergeUserSyncPayload,
} from "@/lib/sync/local-data";
import type { UserSyncPayload } from "@/lib/sync/types";
import {
  getUserSyncState,
  saveUserSyncState,
} from "@/services/sync/user-sync-repository";

const pushSchema = z.object({
  mergeLocal: z.boolean().optional(),
});

export async function GET() {
  const session = await requireAuthSession();
  if (isAuthResponse(session)) {
    return session;
  }

  const state = await getUserSyncState(session.user.id);
  return NextResponse.json({
    state: state ?? null,
    hasLocalData: hasLocalUserData(),
  });
}

export async function PUT(request: Request) {
  const session = await requireAuthSession();
  if (isAuthResponse(session)) {
    return session;
  }

  try {
    const json = await request.json();
    const parsed = pushSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Synchronisation invalide." }, { status: 400 });
    }

    const local = collectLocalUserSyncPayload();
    const remote = await getUserSyncState(session.user.id);
    let incoming: UserSyncPayload = local;

    if (remote && !isUserSyncPayloadEmpty(remote)) {
      incoming =
        parsed.data.mergeLocal !== false
          ? mergeUserSyncPayload(local, remote)
          : remote;
    }

    const saved = await saveUserSyncState(session.user.id, incoming);

    return NextResponse.json({ state: saved });
  } catch {
    return NextResponse.json({ error: "Échec de la synchronisation." }, { status: 500 });
  }
}
