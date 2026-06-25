"use client";

import { useEffect, useId, useRef } from "react";

type ImportFolderPanelProps = {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
};

export function ImportFolderPanel({ disabled, onFiles }: ImportFolderPanelProps) {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    const input = folderInputRef.current;
    if (!input) {
      return;
    }
    input.setAttribute("webkitdirectory", "");
    input.setAttribute("directory", "");
    input.multiple = true;
  }, []);

  return (
    <div className="import-ws-advanced__body">
      <input
        ref={folderInputRef}
        id={inputId}
        type="file"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFiles(Array.from(e.target.files));
          }
          e.target.value = "";
        }}
      />
      <p className="import-ws-advanced__lead">
        Sélectionnez un dossier entier. Tous les fichiers lisibles seront importés.
      </p>
      <button
        type="button"
        className="import-ws-write__choose focus-kb"
        disabled={disabled}
        onClick={() => folderInputRef.current?.click()}
      >
        Importer un dossier
      </button>
    </div>
  );
}
