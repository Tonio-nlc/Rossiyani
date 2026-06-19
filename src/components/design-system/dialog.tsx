"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { GhostButton } from "./ghost-button";
import { PrimaryButton } from "./primary-button";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  closeOnBackdrop?: boolean;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnBackdrop = true,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open");
      requestAnimationFrame(() => {
        dialogRef.current?.querySelector<HTMLElement>("input, button, textarea, select")?.focus();
      });
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const sizeClass =
    size === "lg" ? "max-w-xl" : size === "sm" ? "max-w-sm" : "max-w-md";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        className="ds-dialog-backdrop absolute inset-0"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ds-dialog-title"
        className={["ds-dialog animate-search-in relative w-full", sizeClass].join(" ")}
      >
        <h2 id="ds-dialog-title" className="font-reader text-lg text-[var(--ink)]">
          {title}
        </h2>
        {description ? (
          <div className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">{description}</div>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Annuler",
  confirmVariant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? () => {} : onCancel}
      title={title}
      description={description}
      closeOnBackdrop={!loading}
    >
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <GhostButton onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </GhostButton>
        {confirmVariant === "danger" ? (
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="focus-kb ds-primary-btn ds-primary-btn-danger disabled:opacity-50"
          >
            {loading ? "…" : confirmLabel}
          </button>
        ) : (
          <PrimaryButton onClick={onConfirm} disabled={loading}>
            {loading ? "…" : confirmLabel}
          </PrimaryButton>
        )}
      </div>
    </Dialog>
  );
}
