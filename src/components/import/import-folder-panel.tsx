"use client";

import { useEffect, useId, useRef } from "react";

import { GhostButton } from "@/components/design-system";

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
    <div className="home-ws-details__body">
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
      <p className="home-ws-editor__hint">
        Sélectionnez un dossier entier. Tous les fichiers lisibles seront importés.
      </p>
      <div className="home-ws-actions mt-4">
        <GhostButton type="button" disabled={disabled} onClick={() => folderInputRef.current?.click()}>
          Importer un dossier
        </GhostButton>
      </div>
    </div>
  );
}
