"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DeleteTextDialog } from "@/components/library/delete-text-dialog";
import { RenameTextDialog } from "@/components/library/rename-text-dialog";
import { useToast } from "@/components/ui/toast-provider";
import { getCollectionName } from "@/content/collections";
import type { CefrLevel } from "@/types";
import type { TextListItem } from "@/features/texts";
import { clearLastReadTextIfMatches } from "@/lib/last-read-text";
import { deleteTextRequest, renameTextRequest } from "@/lib/library/text-library-api";
import { clearTextReadingProgress } from "@/lib/reader/reading-progress";

import {
  LibraryWorkspaceCollections,
  parseLibraryCollectionParam,
} from "./library-workspace-collections";
import { LibraryWorkspaceHero } from "./library-workspace-hero";
import { LibraryWorkspaceTextGrid } from "./library-workspace-text-grid";
import { LibrarySearch } from "./library-search";
import { LibrarySectionNav } from "./library-section-nav";
import { filterLibraryTexts } from "./library-utils";

const REMOVE_ANIMATION_MS = 280;

type LibraryViewProps = {
  initialTexts: TextListItem[];
};

type DialogTarget = TextListItem | null;

export function LibraryView({ initialTexts }: LibraryViewProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionFilter = parseLibraryCollectionParam(searchParams.get("collection"));
  const showAllCollections = searchParams.get("collections") === "all";

  const [texts, setTexts] = useState(initialTexts);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<CefrLevel | "all">("all");
  const [renameTarget, setRenameTarget] = useState<DialogTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<DialogTarget>(null);
  const [busyTextId, setBusyTextId] = useState<string | null>(null);
  const [removingTextId, setRemovingTextId] = useState<string | null>(null);
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  const filtered = useMemo(
    () =>
      filterLibraryTexts(
        texts,
        search,
        level,
        collectionFilter ?? "all",
        "all",
      ),
    [texts, search, level, collectionFilter],
  );

  const clearCollectionFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("collection");
    const query = params.toString();
    router.push(query ? `/library?${query}` : "/library");
  }, [router, searchParams]);

  const handleRenameConfirm = useCallback(
    async (title: string) => {
      if (!renameTarget) {
        return;
      }

      const textId = renameTarget.id;
      const previousTitle = renameTarget.title;
      setBusyTextId(textId);
      setTexts((current) =>
        current.map((text) => (text.id === textId ? { ...text, title } : text)),
      );

      try {
        const updated = await renameTextRequest(textId, title);
        setTexts((current) => current.map((text) => (text.id === textId ? updated : text)));
        setRenameTarget(null);
        toast("✓ Texte renommé", "success");
      } catch (error) {
        setTexts((current) =>
          current.map((text) =>
            text.id === textId ? { ...text, title: previousTitle } : text,
          ),
        );
        toast(
          error instanceof Error ? error.message : "Impossible de renommer le texte.",
          "error",
        );
      } finally {
        setBusyTextId(null);
      }
    },
    [renameTarget, toast],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    const textId = deleteTarget.id;
    setBusyTextId(textId);
    setRemovingTextId(textId);

    await new Promise((resolve) => window.setTimeout(resolve, REMOVE_ANIMATION_MS));

    try {
      await deleteTextRequest(textId);
      setTexts((current) => current.filter((text) => text.id !== textId));
      clearTextReadingProgress(textId);
      clearLastReadTextIfMatches(textId);
      setDeleteTarget(null);
      toast("✓ Texte supprimé", "success");
    } catch (error) {
      setRemovingTextId(null);
      toast(
        error instanceof Error ? error.message : "Impossible de supprimer le texte.",
        "error",
      );
    } finally {
      setBusyTextId(null);
    }
  }, [deleteTarget, toast]);

  return (
    <>
      <LibraryWorkspaceHero level={level} onLevelChange={setLevel} />
      <LibrarySectionNav active="texts" />

      <LibraryWorkspaceCollections
        texts={texts}
        activeCollection={collectionFilter}
        clientReady={clientReady}
        showAllCollections={showAllCollections}
      />

      <hr className="library-ws-separator" />

      <section className="library-ws-section library-ws-section--search">
        <LibrarySearch value={search} onChange={setSearch} resultCount={filtered.length} />
        {collectionFilter ? (
          <div>
            <span className="library-ws-filter-chip">
              {getCollectionName(collectionFilter)}
              <button
                type="button"
                className="library-ws-filter-chip__clear focus-kb"
                aria-label="Retirer le filtre collection"
                onClick={clearCollectionFilter}
              >
                ×
              </button>
            </span>
          </div>
        ) : null}
      </section>

      <section
        className="library-ws-section library-ws-section--texts"
        aria-labelledby="library-texts-heading"
      >
        <div className="library-ws-section__head">
          <h2 id="library-texts-heading" className="library-ws-section__title">
            Vos textes
          </h2>
          <p className="library-ws-section__subtitle">
            Lectures importées, prêtes à ouvrir.
          </p>
        </div>
        <LibraryWorkspaceTextGrid
          texts={filtered}
          hasAnyTexts={texts.length > 0}
          busyTextId={busyTextId}
          removingTextId={removingTextId}
          onRename={setRenameTarget}
          onDelete={setDeleteTarget}
        />
      </section>

      <RenameTextDialog
        open={renameTarget !== null}
        currentTitle={renameTarget?.title ?? ""}
        loading={busyTextId === renameTarget?.id}
        onCancel={() => {
          if (busyTextId !== renameTarget?.id) {
            setRenameTarget(null);
          }
        }}
        onConfirm={handleRenameConfirm}
      />

      <DeleteTextDialog
        open={deleteTarget !== null}
        textTitle={deleteTarget?.title ?? ""}
        loading={busyTextId === deleteTarget?.id}
        onCancel={() => {
          if (busyTextId !== deleteTarget?.id) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
