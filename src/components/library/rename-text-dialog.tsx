"use client";

import { useEffect, useState } from "react";

import { ConfirmDialog, InputField } from "@/components/design-system";
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
          <InputField
            id="rename-text-input"
            label="Nouveau titre"
            type="text"
            value={title}
            maxLength={TEXT_TITLE_MAX_LENGTH + 10}
            disabled={loading}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setTitle(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
            hint={`${title.trim().length}/${TEXT_TITLE_MAX_LENGTH} caractères`}
          />
          {error ? <p className="mt-2 text-xs text-[var(--color-secondary)]">{error}</p> : null}
        </>
      }
    />
  );
}
