"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { PrimaryButton } from "@/components/design-system/primary-button";
import type { CategoryId } from "@/content/categories";
import type { CollectionId } from "@/content/collections";
import {
  analyzePastedText,
  hasImportText,
  isImportTitleValid,
  titleFromPaste,
} from "@/lib/import-client";
import type { CefrLevel } from "@/types/domain";

import { ImportMetadataFields } from "./import-metadata-fields";

type ImportPastePanelProps = {
  text: string;
  title: string;
  collectionId: CollectionId;
  categoryId: CategoryId | "";
  level: CefrLevel;
  disabled?: boolean;
  onTextChange: (text: string) => void;
  onTitleChange: (title: string) => void;
  onCollectionChange: (collectionId: CollectionId) => void;
  onCategoryChange: (categoryId: CategoryId | "") => void;
  onLevelChange: (level: CefrLevel) => void;
  onAnalyze: () => void;
};

export function ImportPastePanel({
  text,
  title,
  collectionId,
  categoryId,
  level,
  disabled,
  onTextChange,
  onTitleChange,
  onCollectionChange,
  onCategoryChange,
  onLevelChange,
  onAnalyze,
}: ImportPastePanelProps) {
  const stats = useMemo(() => analyzePastedText(text), [text]);
  const canAnalyze = hasImportText(text) && isImportTitleValid(title);
  const [titleTouched, setTitleTouched] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const lastAutoTitle = useRef("");

  useEffect(() => {
    if (titleTouched || !hasImportText(text)) {
      return;
    }
    const suggested = titleFromPaste(text);
    if (suggested !== lastAutoTitle.current || !title.trim()) {
      lastAutoTitle.current = suggested;
      onTitleChange(suggested);
    }
  }, [text, title, titleTouched, onTitleChange]);

  const handleAnalyze = () => {
    if (!isImportTitleValid(title)) {
      setTitleError("Le nom du texte est obligatoire.");
      return;
    }
    setTitleError(null);
    onAnalyze();
  };

  const showMetadata = hasImportText(text);

  return (
    <>
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={disabled}
        placeholder="Collez ici votre texte russe…"
        rows={10}
        className="import-dropzone__textarea focus-kb"
        aria-label="Texte russe à importer"
      />

      {showMetadata ? (
        <dl className="import-dropzone__stats">
          <div className="import-dropzone__stat">
            <dt>Caractères</dt>
            <dd>{stats.characters.toLocaleString("fr-FR")}</dd>
          </div>
          <div className="import-dropzone__stat">
            <dt>Mots</dt>
            <dd>{stats.words.toLocaleString("fr-FR")}</dd>
          </div>
          <div className="import-dropzone__stat">
            <dt>Phrases estimées</dt>
            <dd>{stats.estimatedSentences}</dd>
          </div>
          <div className="import-dropzone__stat">
            <dt>Lecture estimée</dt>
            <dd>~{stats.estimatedReadingMinutes} min</dd>
          </div>
        </dl>
      ) : null}

      {showMetadata ? (
        <div className="import-dropzone__metadata">
          <ImportMetadataFields
            title={title}
            collectionId={collectionId}
            categoryId={categoryId}
            level={level}
            onTitleChange={(value) => {
              setTitleTouched(true);
              setTitleError(null);
              onTitleChange(value);
            }}
            onCollectionChange={onCollectionChange}
            onCategoryChange={onCategoryChange}
            onLevelChange={onLevelChange}
            disabled={disabled}
            titleError={titleError}
          />
        </div>
      ) : null}

      {showMetadata ? (
        <div className="import-dropzone__actions">
          <PrimaryButton variant="gold" onClick={handleAnalyze} disabled={disabled || !canAnalyze}>
            Transformer en matériel d&apos;apprentissage
          </PrimaryButton>
        </div>
      ) : null}
    </>
  );
}
