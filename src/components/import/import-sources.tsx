"use client";

import type { CategoryId } from "@/content/categories";
import type { CollectionId } from "@/content/collections";
import type { CefrLevel } from "@/types/domain";

import { ImportFilePanel } from "./import-file-panel";
import { ImportFolderPanel } from "./import-folder-panel";
import { ImportPastePanel } from "./import-paste-panel";

type ImportSourcesProps = {
  pastedText: string;
  pasteTitle: string;
  pasteCollectionId: CollectionId;
  pasteCategoryId: CategoryId | "";
  defaultLevel: CefrLevel;
  disabled?: boolean;
  onPastedTextChange: (text: string) => void;
  onPasteTitleChange: (title: string) => void;
  onPasteCollectionChange: (collectionId: CollectionId) => void;
  onPasteCategoryChange: (categoryId: CategoryId | "") => void;
  onLevelChange: (level: CefrLevel) => void;
  onPasteAnalyze: () => void;
  onFiles: (files: File[]) => void;
};

export function ImportSources({
  pastedText,
  pasteTitle,
  pasteCollectionId,
  pasteCategoryId,
  defaultLevel,
  disabled,
  onPastedTextChange,
  onPasteTitleChange,
  onPasteCollectionChange,
  onPasteCategoryChange,
  onLevelChange,
  onPasteAnalyze,
  onFiles,
}: ImportSourcesProps) {
  return (
    <div className="import-dropzone-section">
      <div id="import-paste" className="import-dropzone scroll-mt-24">
        <p className="import-dropzone__intro">
          Ajoutez du contenu russe authentique — Rossiyani le transforme en lecture, vocabulaire,
          concepts et exercices.
        </p>

        <ImportPastePanel
          text={pastedText}
          title={pasteTitle}
          collectionId={pasteCollectionId}
          categoryId={pasteCategoryId}
          level={defaultLevel}
          disabled={disabled}
          onTextChange={onPastedTextChange}
          onTitleChange={onPasteTitleChange}
          onCollectionChange={onPasteCollectionChange}
          onCategoryChange={onPasteCategoryChange}
          onLevelChange={onLevelChange}
          onAnalyze={onPasteAnalyze}
        />

        <div className="import-dropzone__divider" aria-hidden>
          ou
        </div>

        <div id="import-file" className="scroll-mt-24">
          <ImportFilePanel disabled={disabled} onFiles={onFiles} />
        </div>
      </div>

      <ImportFolderPanel disabled={disabled} onFiles={onFiles} />
    </div>
  );
}
