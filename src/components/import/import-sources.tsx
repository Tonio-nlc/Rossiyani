"use client";

import { useLayoutEffect, useRef, useState } from "react";

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
  const segmentRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ width: 0, left: 0 });

  useLayoutEffect(() => {
    const container = segmentRef.current;
    if (!container) {
      return;
    }
    const active = container.querySelector<HTMLElement>(".home-ws-segment__btn--active");
    if (!active) {
      return;
    }
    setIndicator({
      left: active.offsetLeft,
      width: active.offsetWidth,
    });
  }, [tab]);

  return (
    <div className="home-ws-import-source__panel">
      <div className="home-ws-segment" ref={segmentRef} role="tablist" aria-label="Source de contenu">
        <span
          className="home-ws-segment__indicator"
          aria-hidden
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.left}px)`,
          }}
        />
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={[
              "home-ws-segment__btn focus-kb",
              tab === item.id ? "home-ws-segment__btn--active" : "",
            ].join(" ")}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div id="import-paste" className="scroll-mt-24 w-full" role="tabpanel">
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
          <div className="home-ws-editor">
            <div className="home-ws-card home-ws-card--surface">
              <input
                type="url"
                disabled
                placeholder="https://…"
                className="home-ws-url-input focus-kb"
                aria-label="URL de l'article"
              />
              <p className="home-ws-editor__hint mt-4">
                L&apos;import par URL arrive prochainement.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
