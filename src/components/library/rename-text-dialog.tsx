"use client";

import { useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TEXT_TITLE_MAX_LENGTH } from "@/features/texts";

type RenameTextDialogProps = {
  open: boolean;
  currentTitle: string;
  loading?: boolean;
  onConfirm: (title: string) => void;
  onCancel: () => void;
};

export function RenameTextDialog({
  open,
  currentTitle,
  loading = false,
  onConfirm,
  onCancel,
}: RenameTextDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(currentTitle);
      setError(null);
    }
  }, [open, currentTitle]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Le titre est obligatoire.");
      return;
    }
    if (trimmed.length > TEXT_TITLE_MAX_LENGTH) {
      setError(`Le titre ne peut pas dépasser ${TEXT_TITLE_MAX_LENGTH} caractères.`);
      return;
    }
    setError(null);
    onConfirm(trimmed);
  };

  return (
    <ConfirmDialog
      open={open}
      title="Renommer le texte"
      loading={loading}
      confirmLabel="Enregistrer"
      onCancel={onCancel}
      onConfirm={handleSubmit}
      description={
        <>
          <label htmlFor="rename-text-input" className="sr-only">
            Nouveau titre
          </label>
          <input
            id="rename-text-input"
            type="text"
            value={title}
            maxLength={TEXT_TITLE_MAX_LENGTH + 10}
            disabled={loading}
            onChange={(event) => {
              setTitle(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none ring-[var(--accent-violet)] focus:ring-2 disabled:opacity-50"
          />
          <p className="text-xs text-[var(--muted)]">
            {title.trim().length}/{TEXT_TITLE_MAX_LENGTH} caractères
          </p>
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
        </>
      }
    />
  );
}
