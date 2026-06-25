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
        "import-ws-metadata__grid",
        compact ? "import-ws-metadata__grid--compact" : "",
      ].join(" ")}
    >
      <div className="import-ws-field import-ws-field--full">
        <label htmlFor="import-title">
          Nom du texte <span aria-hidden>*</span>
        </label>
        <input
          id="import-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={disabled}
          placeholder="Ex. : В метро"
          className="import-ws-field__title focus-kb"
        />
        {titleError ? (
          <p className="import-ws-field__error">{titleError}</p>
        ) : fileNameHint ? (
          <p className="import-ws-field__hint">Fichier : {fileNameHint}</p>
        ) : null}
      </div>

      <div className="import-ws-field">
        <label htmlFor="import-collection">Collection</label>
        <select
          id="import-collection"
          value={collectionId}
          onChange={(e) => onCollectionChange(e.target.value as CollectionId)}
          disabled={disabled}
          className="focus-kb"
        >
          {COLLECTIONS.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>

      <div className="import-ws-field">
        <label htmlFor="import-category">Catégorie</label>
        <select
          id="import-category"
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value as CategoryId | "")}
          disabled={disabled}
          className="focus-kb"
        >
          <option value="">Aucune</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="import-ws-field import-ws-field--full">
        <label htmlFor="import-level">Niveau CEFR</label>
        <select
          id="import-level"
          value={level}
          onChange={(e) => onLevelChange(e.target.value as CefrLevel)}
          disabled={disabled}
          className="focus-kb"
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
