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
    <details className="import-folder group">
      <summary className="focus-kb">
        <span className="import-folder__title">Importer un dossier</span>
        <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--ink-muted)]">
          option avancée
        </span>
      </summary>

      <div className="import-folder__body">
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
        <p className="text-sm text-[var(--ink-muted)]">
          Sélectionnez un dossier entier. Tous les fichiers lisibles seront importés.
        </p>
        <label
          htmlFor={inputId}
          className={[
            "import-dropzone__file-btn focus-kb mt-3 inline-block",
            disabled ? "pointer-events-none opacity-50" : "",
          ].join(" ")}
        >
          Sélectionner un dossier
        </label>
      </div>
    </details>
  );
}
