"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { TranslationDisplayMode } from "@/lib/reader/translation-display-preference";

import { ReaderIconButton, ReaderIconTranslation } from "./reader-icon-button";

const MODE_OPTIONS: Array<{ value: TranslationDisplayMode; label: string; hint: string }> = [
  {
    value: "hidden",
    label: "Masquées",
    hint: "Aucune traduction affichée",
  },
  {
    value: "manual",
    label: "Manuelles",
    hint: "Phrase par phrase, à la demande",
  },
  {
    value: "all",
    label: "Toutes",
    hint: "Traductions naturelles visibles",
  },
];

type ReaderTranslationMenuProps = {
  mode: TranslationDisplayMode;
  interlinear: boolean;
  onModeChange: (mode: TranslationDisplayMode) => void;
  onInterlinearChange: (enabled: boolean) => void;
};

export function ReaderTranslationMenu({
  mode,
  interlinear,
  onModeChange,
  onInterlinearChange,
}: ReaderTranslationMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const active = mode !== "manual" || interlinear;

  return (
    <div className="reader-ws-translation-menu" ref={rootRef}>
      <ReaderIconButton
        label="Réglages des traductions"
        onClick={() => setOpen((value) => !value)}
        active={active || open}
      >
        <ReaderIconTranslation />
      </ReaderIconButton>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Réglages des traductions"
          className="reader-ws-translation-menu__panel"
        >
          <p className="reader-ws-translation-menu__heading">Traductions</p>

          <fieldset className="reader-ws-translation-menu__fieldset">
            <legend className="reader-ws-translation-menu__legend">Affichage</legend>
            <ul className="reader-ws-translation-menu__options">
              {MODE_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={[
                      "reader-ws-translation-menu__option focus-kb",
                      mode === option.value ? "reader-ws-translation-menu__option--active" : "",
                    ].join(" ")}
                    onClick={() => {
                      onModeChange(option.value);
                    }}
                  >
                    <span className="reader-ws-translation-menu__option-label">{option.label}</span>
                    <span className="reader-ws-translation-menu__option-hint">{option.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </fieldset>

          <label className="reader-ws-translation-menu__check focus-kb">
            <input
              type="checkbox"
              checked={interlinear}
              onChange={(event) => onInterlinearChange(event.target.checked)}
            />
            <span>
              <span className="reader-ws-translation-menu__check-label">Traduction interlinéaire</span>
              <span className="reader-ws-translation-menu__check-hint">
                Structure mot à mot, sous la phrase russe
              </span>
            </span>
          </label>
        </div>
      ) : null}
    </div>
  );
}
