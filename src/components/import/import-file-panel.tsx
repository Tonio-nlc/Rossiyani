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
    <div className="import-ws-write">
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
          "import-ws-write__panel",
          dragOver ? "import-ws-write--drag" : "",
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

        <p className="import-ws-write__hint">
          Choisissez un fichier texte ou PDF à transformer en expérience de lecture.
        </p>
        <button
          type="button"
          className="import-ws-write__choose focus-kb"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          Choisir un fichier
        </button>
        <p className="import-ws-write__formats">.txt · .md · .pdf</p>
      </div>

      <p className="import-ws-write__helper">
        Rossiyani détecte automatiquement les phrases, le vocabulaire, la grammaire et les
        expressions.
      </p>
    </div>
  );
}
