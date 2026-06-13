"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type DeleteTextDialogProps = {
  open: boolean;
  textTitle: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteTextDialog({
  open,
  textTitle,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteTextDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Supprimer ce texte ?"
      confirmLabel="Supprimer"
      confirmVariant="danger"
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
      description={
        <>
          <p>Cette action est irréversible.</p>
          <p>
            Le texte <strong className="text-[var(--foreground)]">« {textTitle} »</strong>, ses
            phrases et ses occurrences seront supprimés.
          </p>
          <p>
            Les concepts du KnowledgeGraph partagés avec d&apos;autres textes seront conservés.
          </p>
        </>
      }
    />
  );
}
