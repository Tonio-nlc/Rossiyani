"use client";

import { useCallback, useMemo, useState } from "react";

import { DeleteTextDialog } from "@/components/library/delete-text-dialog";
import { RenameTextDialog } from "@/components/library/rename-text-dialog";
import { useToast } from "@/components/ui/toast-provider";
import type { CefrLevel } from "@/types";
import type { TextListItem } from "@/features/texts";
import { clearLastReadTextIfMatches } from "@/lib/last-read-text";
import { deleteTextRequest, renameTextRequest } from "@/lib/library/text-library-api";
import { clearTextReadingProgress } from "@/lib/reader/reading-progress";

import { LibraryFilters } from "./library-filters";
import { LibraryGrid } from "./library-grid";
import { LibraryHeader } from "./library-header";
import { LibrarySearch } from "./library-search";
import { filterLibraryTexts, type LibraryCategoryFilter, type LibraryCollectionFilter } from "./library-utils";

const REMOVE_ANIMATION_MS = 280;

type LibraryViewProps = {
  initialTexts: TextListItem[];
  showPageHeader?: boolean;
};

type DialogTarget = TextListItem | null;

export function LibraryView({ initialTexts, showPageHeader = true }: LibraryViewProps) {
  const { toast } = useToast();
  const [texts, setTexts] = useState(initialTexts);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<CefrLevel | "all">("all");
  const [collection, setCollection] = useState<LibraryCollectionFilter>("all");
  const [category, setCategory] = useState<LibraryCategoryFilter>("all");
  const [renameTarget, setRenameTarget] = useState<DialogTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<DialogTarget>(null);
  const [busyTextId, setBusyTextId] = useState<string | null>(null);
  const [removingTextId, setRemovingTextId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterLibraryTexts(texts, search, level, collection, category),
    [texts, search, level, collection, category],
  );

  const totalSentences = texts.reduce((sum, text) => sum + text.sentenceCount, 0);

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
    <div className={showPageHeader ? "space-y-6 pb-16" : "space-y-6"}>
      {showPageHeader ? (
        <LibraryHeader textCount={texts.length} sentenceCount={totalSentences} />
      ) : null}
      <LibrarySearch value={search} onChange={setSearch} resultCount={filtered.length} />
      <LibraryFilters
        level={level}
        collection={collection}
        category={category}
        onLevelChange={setLevel}
        onCollectionChange={setCollection}
        onCategoryChange={setCategory}
      />
      <LibraryGrid
        texts={filtered}
        hasAnyTexts={texts.length > 0}
        busyTextId={busyTextId}
        removingTextId={removingTextId}
        onRename={setRenameTarget}
        onDelete={setDeleteTarget}
      />

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
    </div>
  );
}
