"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
    <div className="home-ws-editor">
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={disabled}
        placeholder="Collez votre texte russe ici…"
        rows={10}
        className="home-ws-editor__area focus-kb"
        aria-label="Texte russe à importer"
      />

      <p className="home-ws-editor__hint">
        Rossiyani détecte automatiquement les phrases, le vocabulaire, la grammaire et les
        expressions.
      </p>

      {showMetadata ? (
        <dl className="home-ws-stat-grid">
          <div>
            <dt>Caractères</dt>
            <dd>{stats.characters.toLocaleString("fr-FR")}</dd>
          </div>
          <div>
            <dt>Mots</dt>
            <dd>{stats.words.toLocaleString("fr-FR")}</dd>
          </div>
          <div>
            <dt>Phrases estimées</dt>
            <dd>{stats.estimatedSentences}</dd>
          </div>
          <div>
            <dt>Lecture estimée</dt>
            <dd>~{stats.estimatedReadingMinutes} min</dd>
          </div>
        </dl>
      ) : null}

      {showMetadata ? (
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
      ) : null}

      {showMetadata ? (
        <div className="home-ws-actions">
          <button
            type="button"
            className="home-ws-btn home-ws-btn--pill focus-kb"
            onClick={handleAnalyze}
            disabled={disabled || !canAnalyze}
          >
            Analyser le texte
          </button>
        </div>
      ) : null}
    </div>
  );
}
