"use client";

import { useCallback, useRef, useState } from "react";

import { PrimaryButton } from "@/components/design-system";

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
    <div className="home-ws-editor">
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
          "home-ws-dropzone",
          dragOver ? "home-ws-dropzone--active" : "",
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

        <p className="home-ws-dropzone__hint">
          Choisissez un fichier texte ou PDF à transformer en expérience de lecture.
        </p>
        <PrimaryButton
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          Choisir un fichier
        </PrimaryButton>
        <p className="home-ws-dropzone__formats">.txt · .md · .pdf</p>
      </div>

      <p className="home-ws-editor__hint">
        Rossiyani détecte automatiquement les phrases, le vocabulaire, la grammaire et les
        expressions.
      </p>
    </div>
  );
}
