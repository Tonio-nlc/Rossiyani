"use client";

import { useEffect, useRef, useState } from "react";

type LibraryCardActionsProps = {
  onRename: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

export function LibraryCardActions({
  onRename,
  onDelete,
  disabled = false,
}: LibraryCardActionsProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const timerId = window.setTimeout(() => {
      window.addEventListener("click", onClick);
    }, 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Actions du texte"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="btn-interactive flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]/90 text-[var(--muted)] backdrop-blur-sm transition hover:text-[var(--foreground)] disabled:opacity-50"
      >
        ⋮
      </button>

      {open ? (
        <div
          role="menu"
          className="animate-search-in absolute right-0 top-full z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] py-1 shadow-[var(--shadow-soft)]"
        >
          <MenuItem
            label="Renommer"
            icon="✎"
            onClick={() => {
              setOpen(false);
              onRename();
            }}
          />
          <MenuItem
            label="Supprimer"
            icon="🗑"
            danger
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  label,
  icon,
  danger,
  onClick,
}: {
  label: string;
  icon: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={[
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-[var(--surface)]",
        danger ? "text-red-300" : "text-[var(--foreground)]",
      ].join(" ")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </button>
  );
}
