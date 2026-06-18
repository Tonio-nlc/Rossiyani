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
    <div className="space-y-8">
      <div
        id="import-paste"
        className="scroll-mt-24 rounded-2xl border border-[var(--hairline)] px-5 py-6 sm:px-7 sm:py-7"
      >
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
      </div>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[var(--hairline)]" />
        <span className="text-xs uppercase tracking-wider text-[var(--ink-muted)]">or</span>
        <div className="h-px flex-1 bg-[var(--hairline)]" />
      </div>

      <div id="import-file" className="scroll-mt-24">
        <ImportFilePanel disabled={disabled} onFiles={onFiles} />
      </div>

      <ImportFolderPanel disabled={disabled} onFiles={onFiles} />
    </div>
  );
}
