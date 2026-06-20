"use client";

import { useEffect, useRef, useState } from "react";

type LibraryCardActionsProps = {
  onRename: () => void;
  onDelete: () => void;
  disabled?: boolean;
  catalog?: boolean;
};

export function LibraryCardActions({
  onRename,
  onDelete,
  disabled = false,
  catalog = false,
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

  const triggerClass = catalog
    ? "library-catalog-card-menu-btn focus-kb"
    : "btn-interactive flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]/90 text-[var(--muted)] backdrop-blur-sm transition hover:text-[var(--foreground)] disabled:opacity-50";

  const menuClass = catalog
    ? "library-catalog-card-menu-panel"
    : "animate-search-in absolute right-0 top-full z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] py-1 shadow-[var(--shadow-soft)]";

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
        className={triggerClass}
      >
        ⋮
      </button>

      {open ? (
        <div role="menu" className={menuClass}>
          <MenuItem
            label="Renommer"
            icon="✎"
            catalog={catalog}
            onClick={() => {
              setOpen(false);
              onRename();
            }}
          />
          <MenuItem
            label="Supprimer"
            icon="🗑"
            danger
            catalog={catalog}
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
  catalog,
  onClick,
}: {
  label: string;
  icon: string;
  danger?: boolean;
  catalog?: boolean;
  onClick: () => void;
}) {
  const className = catalog
    ? [
        "library-catalog-card-menu-item",
        danger ? "library-catalog-card-menu-item-danger" : "",
      ].join(" ")
    : [
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-[var(--surface)]",
        danger ? "text-red-300" : "text-[var(--foreground)]",
      ].join(" ");

  return (
    <button
      type="button"
      role="menuitem"
      className={className}
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
