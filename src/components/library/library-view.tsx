"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/design-system";
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
import { LibraryWorkspaceTextGrid } from "./library-workspace-text-grid";
import { LibrarySearch } from "./library-search";
import { filterLibraryTexts, LIBRARY_LEVELS } from "./library-utils";

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
    () => filterLibraryTexts(texts, search, level, collectionFilter ?? "all", "all"),
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
      <header className="lessons-hero library-ws-hero">
        <p className="r3-eyebrow lessons-hero__eyebrow">Vos lectures</p>
        <h1 className="r3-hero-title lessons-hero__title">Bibliothèque</h1>
        <p className="r3-lead lessons-hero__lead">
          Collections curatées et textes importés — lisez, progressez, retrouvez vos lectures.
        </p>
        <div className="lessons-hero__metrics">
          <Badge tone="neutral">
            {texts.length} texte{texts.length === 1 ? "" : "s"}
          </Badge>
          {collectionFilter ? (
            <Badge tone="amber">{getCollectionName(collectionFilter)}</Badge>
          ) : null}
        </div>
      </header>

      <LibraryWorkspaceCollections
        texts={texts}
        activeCollection={collectionFilter}
        clientReady={clientReady}
      />

      <section className="lessons-section" aria-labelledby="library-texts-heading">
        <div className="lessons-section__head">
          <div>
            <h2 id="library-texts-heading" className="r3-title lessons-section__title">
              Vos textes
            </h2>
            <p className="r3-lead lessons-section__subtitle">
              {collectionFilter
                ? `Textes de la collection « ${getCollectionName(collectionFilter)} ».`
                : "Toutes vos lectures importées, prêtes à ouvrir."}
            </p>
          </div>
        </div>

        <nav className="lessons-level-nav library-ws-levels" aria-label="Niveau">
          <button
            type="button"
            aria-pressed={level === "all"}
            onClick={() => setLevel("all")}
            className={[
              "library-ws-level-pill focus-kb",
              level === "all" ? "library-ws-level-pill--active" : "",
            ].join(" ")}
          >
            Tous
          </button>
          {LIBRARY_LEVELS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={level === value}
              onClick={() => setLevel(value)}
              className={[
                "library-ws-level-pill focus-kb",
                level === value ? "library-ws-level-pill--active" : "",
              ].join(" ")}
            >
              {value}
            </button>
          ))}
        </nav>

        <div className="library-ws-filters">
          <LibrarySearch value={search} onChange={setSearch} resultCount={filtered.length} />
          {collectionFilter ? (
            <button
              type="button"
              className="lessons-level-pill focus-kb"
              onClick={clearCollectionFilter}
            >
              Retirer le filtre · {getCollectionName(collectionFilter)}
            </button>
          ) : null}
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
