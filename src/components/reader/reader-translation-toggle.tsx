"use client";

type ReaderTranslationToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ReaderTranslationToggle({ checked, onChange }: ReaderTranslationToggleProps) {
  return (
    <label className="focus-kb flex cursor-pointer select-none items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]/60 px-3 py-2 text-xs text-[var(--muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 rounded border-[var(--border-strong)] accent-[var(--accent-violet-bright)]"
      />
      <span>Afficher les traductions</span>
    </label>
  );
}
