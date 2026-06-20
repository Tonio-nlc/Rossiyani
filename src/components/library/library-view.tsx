"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { GhostButton } from "@/components/design-system";
import { DeleteTextDialog } from "@/components/library/delete-text-dialog";
import { RenameTextDialog } from "@/components/library/rename-text-dialog";
import { useToast } from "@/components/ui/toast-provider";
import type { CefrLevel } from "@/types";
import type { TextListItem } from "@/features/texts";
import { clearLastReadTextIfMatches } from "@/lib/last-read-text";
import { deleteTextRequest, renameTextRequest } from "@/lib/library/text-library-api";
import { clearTextReadingProgress, getAllReadingProgress } from "@/lib/reader/reading-progress";

import { LibraryCollectionsRow } from "./library-collections-row";
import { LibraryFilters } from "./library-filters";
import { LibraryGrid } from "./library-grid";
import { LibrarySearch } from "./library-search";
import {
  filterLibraryTexts,
  type LibraryCategoryFilter,
  type LibraryCollectionFilter,
} from "./library-utils";

const REMOVE_ANIMATION_MS = 280;

type LibraryViewProps = {
  initialTexts: TextListItem[];
};

type DialogTarget = TextListItem | null;

function hasActiveFilters(
  search: string,
  level: CefrLevel | "all",
  collection: LibraryCollectionFilter,
  category: LibraryCategoryFilter,
): boolean {
  return (
    search.trim().length > 0 ||
    level !== "all" ||
    collection !== "all" ||
    category !== "all"
  );
}

export function LibraryView({ initialTexts }: LibraryViewProps) {
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

  const filtersActive = hasActiveFilters(search, level, collection, category);

  const [inProgressTexts, setInProgressTexts] = useState<TextListItem[]>([]);
  const [recentTexts, setRecentTexts] = useState<TextListItem[]>([]);

  useEffect(() => {
    const progress = getAllReadingProgress();
    const inProgress = texts
      .filter((text) => {
        const entry = progress[text.id];
        return entry && entry.percent > 0 && entry.percent < 100;
      })
      .sort(
        (left, right) =>
          new Date(progress[right.id]!.lastReadAt).getTime() -
          new Date(progress[left.id]!.lastReadAt).getTime(),
      )
      .slice(0, 3);
    const inProgressIds = new Set(inProgress.map((text) => text.id));
    const recent = Object.values(progress)
      .sort(
        (left, right) =>
          new Date(right.lastReadAt).getTime() - new Date(left.lastReadAt).getTime(),
      )
      .map((entry) => texts.find((text) => text.id === entry.textId))
      .filter((text): text is TextListItem => Boolean(text))
      .filter((text) => !inProgressIds.has(text.id))
      .slice(0, 3);
    setInProgressTexts(inProgress);
    setRecentTexts(recent);
  }, [texts]);

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

  const handleCollectionSelect = useCallback((value: LibraryCollectionFilter) => {
    setCollection(value);
  }, []);

  return (
    <div className="space-y-0 pb-8">
      {inProgressTexts.length > 0 && !filtersActive ? (
        <section className="library-page-section space-y-3 pb-0" aria-label="En cours">
          <p className="text-eyebrow">En cours</p>
          <ul className="space-y-3">
            {inProgressTexts.map((text) => (
              <li
                key={text.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3 last:border-0 last:pb-0"
              >
                <p className="min-w-0 font-reader text-[var(--ink)]">{text.title}</p>
                <GhostButton href={`/texts/${text.id}`}>Lire →</GhostButton>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recentTexts.length > 0 && !filtersActive ? (
        <section className="library-page-section space-y-3 pb-0" aria-label="Récents">
          <p className="text-eyebrow">Récents</p>
          <ul className="space-y-3">
            {recentTexts.map((text) => (
              <li
                key={text.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] pb-3 last:border-0 last:pb-0"
              >
                <p className="min-w-0 font-reader text-[var(--ink)]">{text.title}</p>
                <GhostButton href={`/texts/${text.id}`}>Lire →</GhostButton>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <LibraryCollectionsRow active={collection} onSelect={handleCollectionSelect} />

      <LibrarySearch value={search} onChange={setSearch} resultCount={filtered.length} />

      <LibraryFilters
        level={level}
        category={category}
        onLevelChange={setLevel}
        onCategoryChange={setCategory}
        onResetAll={
          filtersActive
            ? () => {
                setSearch("");
                setLevel("all");
                setCategory("all");
                setCollection("all");
              }
            : undefined
        }
      />

      <section className="library-page-section">
        <LibraryGrid
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
    </div>
  );
}
