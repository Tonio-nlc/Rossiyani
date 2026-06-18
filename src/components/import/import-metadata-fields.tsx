"use client";

import { getAllCategories } from "@/content/categories";
import { getAllCollections, type CollectionId } from "@/content/collections";
import type { CategoryId } from "@/content/categories";
import type { CefrLevel } from "@/types/domain";

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "Native"];
const COLLECTIONS = getAllCollections();
const CATEGORIES = getAllCategories();

type ImportMetadataFieldsProps = {
  title: string;
  collectionId: CollectionId;
  categoryId: CategoryId | "";
  level: CefrLevel;
  onTitleChange: (value: string) => void;
  onCollectionChange: (collectionId: CollectionId) => void;
  onCategoryChange: (categoryId: CategoryId | "") => void;
  onLevelChange: (level: CefrLevel) => void;
  disabled?: boolean;
  titleError?: string | null;
  fileNameHint?: string;
  compact?: boolean;
};

const fieldClass =
  "focus-kb mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent-violet)]/40";

export function ImportMetadataFields({
  title,
  collectionId,
  categoryId,
  level,
  onTitleChange,
  onCollectionChange,
  onCategoryChange,
  onLevelChange,
  disabled,
  titleError,
  fileNameHint,
  compact = false,
}: ImportMetadataFieldsProps) {
  return (
    <div
      className={[
        "grid gap-4",
        compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 lg:grid-cols-2",
      ].join(" ")}
    >
      <div className={compact ? "sm:col-span-2" : "lg:col-span-2"}>
        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Nom du texte <span className="text-red-300">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={disabled}
          placeholder="Ex. : В метро"
          className={[
            "focus-kb mt-1.5 w-full rounded-xl border bg-[var(--surface)] px-3 py-2.5 font-reader text-base text-[var(--foreground)] placeholder:text-[var(--muted)]/60",
            titleError
              ? "border-red-500/40 focus:border-red-500/50"
              : "border-[var(--border)] focus:border-[var(--accent-violet)]/40",
          ].join(" ")}
        />
        {titleError ? (
          <p className="mt-1 text-xs text-red-300">{titleError}</p>
        ) : fileNameHint ? (
          <p className="mt-1 text-xs text-[var(--muted)]">Fichier : {fileNameHint}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Collection
        </label>
        <select
          value={collectionId}
          onChange={(e) => onCollectionChange(e.target.value as CollectionId)}
          disabled={disabled}
          className={fieldClass}
        >
          {COLLECTIONS.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Catégorie
        </label>
        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value as CategoryId | "")}
          disabled={disabled}
          className={fieldClass}
        >
          <option value="">Aucune</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className={compact ? "sm:col-span-2" : "lg:col-span-2"}>
        <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Niveau CEFR
        </label>
        <select
          value={level}
          onChange={(e) => onLevelChange(e.target.value as CefrLevel)}
          disabled={disabled}
          className={fieldClass}
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
