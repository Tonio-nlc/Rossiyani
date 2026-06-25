"use client";

import type { CategoryId } from "@/content/categories";
import type { CollectionId } from "@/content/collections";
import { countWords, formatFileSize, isImportTitleValid } from "@/lib/import-client";
import type { PendingImportFile } from "@/lib/import-client";
import type { CefrLevel } from "@/types/domain";

import { ImportMetadataFields } from "./import-metadata-fields";

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
    <section className="import-staged animate-fade-up">
      <div>
        <h2 className="import-ws-section__title">
          Préparer {files.length > 1 ? "les textes" : "le texte"}
        </h2>
        <p className="import-ws-section__lead">
          Vérifiez le nom, la collection, la catégorie et le niveau avant la transformation.
        </p>
      </div>

      <ul className="space-y-4">
        {files.map((file) => (
          <li key={file.id} className="import-staged__card">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-4">
                <ImportMetadataFields
                  title={file.title}
                  collectionId={file.collectionId}
                  categoryId={file.categoryIds[0] ?? ""}
                  level={file.level}
                  onTitleChange={(value) => onTitleChange(file.id, value)}
                  onCollectionChange={(value) => onCollectionChange(file.id, value)}
                  onCategoryChange={(value) =>
                    onCategoryChange(file.id, value)
                  }
                  onLevelChange={(level) => onLevelChange(file.id, level)}
                  disabled={disabled}
                  fileNameHint={file.fileName}
                  titleError={
                    !isImportTitleValid(file.title) ? "Le nom du texte est obligatoire." : null
                  }
                  compact
                />

                <dl className="import-ws-stats">
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
                  <div className="import-staged__pdf">
                    {file.category ? (
                      <p className="import-staged__pdf-category">{file.category}</p>
                    ) : null}
                    {file.summary ? (
                      <p className="import-staged__pdf-summary">{file.summary}</p>
                    ) : null}
                    {file.focusPoints && file.focusPoints.length > 0 ? (
                      <ul className="import-staged__tags">
                        {file.focusPoints.map((point) => (
                          <li key={point} className="import-staged__tag">
                            {point}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {files.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  disabled={disabled}
                  className="focus-kb shrink-0 rounded-lg px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  aria-label={`Retirer ${file.fileName}`}
                >
                  Retirer
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {files.length > 1 ? (
        <p className="text-sm text-[var(--muted)]">
          {files.length} textes · {totalSentences} phrases estimées au total
        </p>
      ) : null}

      <div className="import-ws-actions">
        <button
          type="button"
          className="import-ws-btn focus-kb"
          onClick={onImport}
          disabled={disabled || !allTitlesValid}
        >
          Analyser le texte
          {files.length > 1 ? ` (${files.length})` : ""}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="import-ws-btn import-ws-btn--ghost focus-kb"
        >
          Annuler
        </button>
      </div>
    </section>
  );
}
