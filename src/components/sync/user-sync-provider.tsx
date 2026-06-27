"use client";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  applyUserSyncPayload,
  collectLocalUserSyncPayload,
  hasLocalUserData,
  isUserSyncPayloadEmpty,
} from "@/lib/sync/local-data";
import { pullUserSyncState, pushUserSyncState } from "@/lib/sync/sync-client";

const SYNC_DEBOUNCE_MS = 2500;

export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [migrationOpen, setMigrationOpen] = useState(false);
  const syncTimerRef = useRef<number | null>(null);
  const lastHashRef = useRef<string>("");
  const patchedRef = useRef(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setMigrationOpen(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const { state } = await pullUserSyncState();
        if (cancelled) {
          return;
        }

        const local = collectLocalUserSyncPayload();
        const localHas = hasLocalUserData();
        const remoteEmpty = !state || isUserSyncPayloadEmpty(state);

        if (localHas && remoteEmpty) {
          await pushUserSyncState({ mergeLocal: true });
          return;
        }

        if (!localHas && state && !isUserSyncPayloadEmpty(state)) {
          applyUserSyncPayload(state);
          return;
        }

        if (localHas && state && !isUserSyncPayloadEmpty(state)) {
          setMigrationOpen(true);
          return;
        }
      } catch {
        // Sync is best-effort; local data remains available offline.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  useEffect(() => {
    if (!user || typeof window === "undefined" || patchedRef.current) {
      return;
    }

    patchedRef.current = true;
    const originalSetItem = localStorage.setItem.bind(localStorage);

    localStorage.setItem = (key: string, value: string) => {
      originalSetItem(key, value);
      if (!key.startsWith("rossiyani:")) {
        return;
      }
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
      syncTimerRef.current = window.setTimeout(() => {
        const payload = collectLocalUserSyncPayload();
        const hash = JSON.stringify(payload);
        if (hash === lastHashRef.current) {
          return;
        }
        lastHashRef.current = hash;
        void pushUserSyncState({ mergeLocal: false }).catch(() => undefined);
      }, SYNC_DEBOUNCE_MS);
    };

    return () => {
      localStorage.setItem = originalSetItem;
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, [user]);

  return (
    <>
      {children}
      {migrationOpen ? (
        <div className="sync-migration" role="dialog" aria-labelledby="sync-migration-title">
          <div className="sync-migration__card">
            <h2 id="sync-migration-title" className="sync-migration__title">
              Synchroniser vos données ?
            </h2>
            <p className="sync-migration__copy">
              Des données existent sur cet appareil et sur votre compte. Souhaitez-vous les fusionner
              pour ne rien perdre ?
            </p>
            <div className="sync-migration__actions">
              <button
                type="button"
                className="sync-migration__btn sync-migration__btn--primary focus-kb"
                onClick={() => {
                  void pushUserSyncState({ mergeLocal: true }).finally(() => {
                    setMigrationOpen(false);
                  });
                }}
              >
                Fusionner
              </button>
              <button
                type="button"
                className="sync-migration__btn focus-kb"
                onClick={() => {
                  void pullUserSyncState()
                    .then(({ state }) => {
                      if (state) {
                        applyUserSyncPayload(state);
                      }
                    })
                    .finally(() => setMigrationOpen(false));
                }}
              >
                Garder le compte
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
