"use client";

import { useEffect, useRef, useState } from "react";

type LibraryCardActionsProps = {
  onRename: () => void;
  onDelete: () => void;
  disabled?: boolean;
  editorial?: boolean;
};

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="lib-text-card__action-icon">
      <path
        d="M4 2.75h8a.75.75 0 0 1 .75.75v9.5L8 10.75 3.25 13V3.5a.75.75 0 0 1 .75-.75Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LibraryCardActions({
  onRename,
  onDelete,
  disabled = false,
  editorial = false,
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

  if (!editorial) {
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
            <LegacyMenuItem label="Renommer" icon="✎" onClick={() => { setOpen(false); onRename(); }} />
            <LegacyMenuItem label="Supprimer" icon="🗑" danger onClick={() => { setOpen(false); onDelete(); }} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={menuRef} className="lib-text-card__actions">
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
        className="lib-text-card__action-btn focus-kb"
      >
        <BookmarkIcon />
      </button>

      {open ? (
        <div role="menu" className="lib-text-card__menu">
          <EditorialMenuItem
            label="Renommer"
            onClick={() => {
              setOpen(false);
              onRename();
            }}
          />
          <EditorialMenuItem
            label="Supprimer"
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

function LegacyMenuItem({
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

function EditorialMenuItem({
  label,
  danger,
  onClick,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={[
        "lib-text-card__menu-item",
        danger ? "lib-text-card__menu-item-danger" : "",
      ].join(" ")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
    >
      {label}
    </button>
  );
}
