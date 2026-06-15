"use client";

import { useCallback, useRef, useState } from "react";

type ImportFilePanelProps = {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
};

export const IMPORT_FILE_ACCEPT =
  ".txt,.md,.pdf,text/plain,text/markdown,application/pdf,application/octet-stream,text/*";

export function ImportFilePanel({ disabled, onFiles }: ImportFilePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled || fileList.length === 0) {
        return;
      }
      onFiles(Array.from(fileList));
    },
    [disabled, onFiles],
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          📄
        </span>
        <h2 className="font-reader text-xl font-semibold text-[var(--foreground)]">
          Choisir un fichier
        </h2>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={[
          "flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all duration-300",
          dragOver
            ? "border-[var(--accent-violet-bright)] bg-[var(--accent-violet)]/10"
            : "border-[var(--border)] bg-[var(--surface)]",
          disabled ? "pointer-events-none opacity-50" : "",
        ].join(" ")}
      >
        <input
          ref={fileInputRef}
          id="import-file-picker"
          type="file"
          accept={IMPORT_FILE_ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <p className="text-sm text-[var(--muted)]">Glisser-déposer ou choisir un fichier</p>
        <label
          htmlFor="import-file-picker"
          className={[
            "focus-kb btn-interactive mt-4 cursor-pointer rounded-xl border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent-violet)]/40",
            disabled ? "pointer-events-none opacity-50" : "",
          ].join(" ")}
        >
          Choisir un fichier
        </label>
        <p className="mt-3 text-[11px] text-[var(--muted)]">
          .txt · .md · .pdf · text/plain
        </p>
      </div>
    </section>
  );
}
