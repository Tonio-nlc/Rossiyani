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
    <details className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)]/50">
      <summary className="focus-kb cursor-pointer list-none px-4 py-3 text-sm text-[var(--muted)] marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden>📁</span>
          <span className="font-medium text-[var(--foreground)]">Importer un dossier</span>
          <span className="text-[10px] uppercase tracking-wide">(option avancée)</span>
          <span className="ml-1 text-[var(--muted)] transition group-open:rotate-180">▾</span>
        </span>
      </summary>

      <div className="border-t border-[var(--border)] px-4 py-4">
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
        <p className="text-sm text-[var(--muted)]">
          Sélectionnez un dossier entier. Tous les fichiers lisibles seront importés.
        </p>
        <label
          htmlFor={inputId}
          className={[
            "focus-kb btn-interactive mt-3 inline-block cursor-pointer rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-elevated)]",
            disabled ? "pointer-events-none opacity-50" : "",
          ].join(" ")}
        >
          Sélectionner un dossier
        </label>
      </div>
    </details>
  );
}
