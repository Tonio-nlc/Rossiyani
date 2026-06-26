"use client";

import type { CategoryId } from "@/content/categories";
import type { CollectionId } from "@/content/collections";
import { countWords, formatFileSize, isImportTitleValid } from "@/lib/import-client";
import type { PendingImportFile } from "@/lib/import-client";
import type { CefrLevel } from "@/types/domain";

import { ImportMetadataFields } from "./import-metadata-fields";
import { Card, GhostButton, PrimaryButton, TextButton } from "@/components/design-system";

type ImportFilePreviewProps = {
  files: PendingImportFile[];
  disabled?: boolean;
  onTitleChange: (id: string, title: string) => void;
  onCollectionChange: (id: string, collectionId: CollectionId) => void;
  onCategoryChange: (id: string, categoryId: CategoryId | "") => void;
  onLevelChange: (id: string, level: CefrLevel) => void;
  onRemove: (id: string) => void;
  onImport: () => void;
  onCancel: () => void;
};

export function ImportFilePreview({
  files,
  disabled,
  onTitleChange,
  onCollectionChange,
  onCategoryChange,
  onLevelChange,
  onRemove,
  onImport,
  onCancel,
}: ImportFilePreviewProps) {
  if (files.length === 0) {
    return null;
  }

  const totalSentences = files.reduce((sum, f) => sum + f.estimatedSentences, 0);
  const allTitlesValid = files.every((f) => isImportTitleValid(f.title));

  return (
    <section className="animate-fade-up">
      <div className="home-ws-section__head">
        <h2 className="home-ws-section__title">
          Préparer {files.length > 1 ? "les textes" : "le texte"}
        </h2>
        <p className="home-ws-section__subtitle">
          Vérifiez le nom, la collection, la catégorie et le niveau avant la transformation.
        </p>
      </div>

      <ul className="home-ws-staged-list">
        {files.map((file) => (
          <li key={file.id}>
            <Card as="article" className="home-ws-card--surface">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-4">
                  <ImportMetadataFields
                    title={file.title}
                    collectionId={file.collectionId}
                    categoryId={file.categoryIds[0] ?? ""}
                    level={file.level}
                    onTitleChange={(value) => onTitleChange(file.id, value)}
                    onCollectionChange={(value) => onCollectionChange(file.id, value)}
                    onCategoryChange={(value) => onCategoryChange(file.id, value)}
                    onLevelChange={(level) => onLevelChange(file.id, level)}
                    disabled={disabled}
                    fileNameHint={file.fileName}
                    titleError={
                      !isImportTitleValid(file.title) ? "Le nom du texte est obligatoire." : null
                    }
                    compact
                  />

                  <dl className="home-ws-stat-grid">
                    <div>
                      <dt>Taille</dt>
                      <dd>{formatFileSize(file.fileSizeBytes)}</dd>
                    </div>
                    <div>
                      <dt>Phrases estimées</dt>
                      <dd>{file.estimatedSentences}</dd>
                    </div>
                    <div>
                      <dt>Mots</dt>
                      <dd>{countWords(file.rawText)}</dd>
                    </div>
                    <div>
                      <dt>Niveau détecté</dt>
                      <dd>{file.detectedLevel ?? "—"}</dd>
                    </div>
                    {file.estimatedReadingMinutes ? (
                      <div>
                        <dt>Lecture estimée</dt>
                        <dd>{file.estimatedReadingMinutes} min</dd>
                      </div>
                    ) : null}
                  </dl>

                  {file.sourceType === "pdf" && (file.summary || file.category || file.focusPoints?.length) ? (
                    <div className="home-ws-pdf-summary">
                      {file.category ? (
                        <p className="home-ws-pdf-summary__category">{file.category}</p>
                      ) : null}
                      {file.summary ? (
                        <p className="home-ws-pdf-summary__text">{file.summary}</p>
                      ) : null}
                      {file.focusPoints && file.focusPoints.length > 0 ? (
                        <ul className="home-ws-tag-list">
                          {file.focusPoints.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {files.length > 1 ? (
                  <TextButton
                    onClick={() => onRemove(file.id)}
                    disabled={disabled}
                    className="shrink-0"
                  >
                    Retirer
                  </TextButton>
                ) : null}
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {files.length > 1 ? (
        <p className="home-ws-section__subtitle">
          {files.length} textes · {totalSentences} phrases estimées au total
        </p>
      ) : null}

      <div className="home-ws-actions">
        <PrimaryButton type="button" onClick={onImport} disabled={disabled || !allTitlesValid}>
          Analyser le texte
          {files.length > 1 ? ` (${files.length})` : ""}
        </PrimaryButton>
        <GhostButton type="button" onClick={onCancel} disabled={disabled}>
          Annuler
        </GhostButton>
      </div>
    </section>
  );
}
