import { prisma } from "@/lib/prisma";

import {
  EMPTY_USER_SYNC_PAYLOAD,
  USER_SYNC_VERSION,
  type UserSyncPayload,
  type UserSyncState,
} from "@/lib/sync/types";

function parsePayload(raw: unknown): UserSyncPayload {
  if (!raw || typeof raw !== "object") {
    return EMPTY_USER_SYNC_PAYLOAD;
  }
  const data = raw as Partial<UserSyncPayload>;
  return {
    readingProgress: data.readingProgress ?? {},
    savedWords: data.savedWords ?? [],
    bookmarks: data.bookmarks ?? [],
    savedSentences: data.savedSentences ?? [],
    savedDiscoveries: data.savedDiscoveries ?? [],
    preferences: {
      ...EMPTY_USER_SYNC_PAYLOAD.preferences,
      ...(data.preferences ?? {}),
    },
  };
}

export async function getUserSyncState(userId: string): Promise<UserSyncState | null> {
  const row = await prisma.userData.findUnique({ where: { userId } });
  if (!row) {
    return null;
  }

  return {
    ...parsePayload(row.payload),
    version: row.version,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function saveUserSyncState(userId: string, payload: UserSyncPayload): Promise<UserSyncState> {
  const row = await prisma.userData.upsert({
    where: { userId },
    create: {
      userId,
      version: USER_SYNC_VERSION,
      payload,
    },
    update: {
      version: USER_SYNC_VERSION,
      payload,
    },
  });

  return {
    ...parsePayload(row.payload),
    version: row.version,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function ensureUserDataRow(userId: string): Promise<UserSyncState> {
  const existing = await getUserSyncState(userId);
  if (existing) {
    return existing;
  }
  return saveUserSyncState(userId, EMPTY_USER_SYNC_PAYLOAD);
}
