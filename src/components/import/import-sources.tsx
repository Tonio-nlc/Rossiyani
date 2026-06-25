"use client";

import { useState } from "react";

import type { CategoryId } from "@/content/categories";
import type { CollectionId } from "@/content/collections";
import type { CefrLevel } from "@/types/domain";

import { ImportFilePanel } from "./import-file-panel";
import { ImportPastePanel } from "./import-paste-panel";

type ImportSourceTab = "text" | "pdf" | "url";

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

const TABS: Array<{ id: ImportSourceTab; label: string }> = [
  { id: "text", label: "Text" },
  { id: "pdf", label: "PDF" },
  { id: "url", label: "URL" },
];

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
  const [tab, setTab] = useState<ImportSourceTab>("text");

  return (
    <div className="import-ws-source">
      <div className="import-ws-segment" role="tablist" aria-label="Source de contenu">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={[
              "import-ws-segment__btn focus-kb",
              tab === item.id ? "import-ws-segment__btn--active" : "",
            ].join(" ")}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div id="import-paste" className="scroll-mt-24" role="tabpanel">
        {tab === "text" ? (
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
        ) : null}

        {tab === "pdf" ? (
          <div id="import-file" className="scroll-mt-24">
            <ImportFilePanel disabled={disabled} onFiles={onFiles} />
          </div>
        ) : null}

        {tab === "url" ? (
          <div className="import-ws-write">
            <div className="import-ws-write__panel">
              <input
                type="url"
                disabled
                placeholder="https://…"
                className="import-ws-write__url"
                aria-label="URL de l'article"
              />
              <p className="import-ws-write__helper import-ws-write__helper--soon">
                L&apos;import par URL arrive prochainement.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
