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
        "import-dropzone__file",
        dragOver ? "import-dropzone__file--active" : "",
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

      <p className="import-dropzone__file-hint">Glissez un fichier ici ou parcourez votre appareil</p>
      <label htmlFor="import-file-picker" className="import-dropzone__file-btn focus-kb">
        Choisir un fichier
      </label>
      <p className="import-dropzone__file-formats">.txt · .md · .pdf</p>
    </div>
  );
}
