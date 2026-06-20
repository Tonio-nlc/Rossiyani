import { GhostButton } from "@/components/design-system";

export function LibraryImportCard() {
  return (
    <section className="library-page-section library-catalog-suggest" aria-label="Suggérer un texte">
      <p className="library-catalog-suggest-label">Suggérer un texte</p>
      <div className="library-catalog-suggest-actions">
        <GhostButton href="/import#paste">Coller →</GhostButton>
        <GhostButton href="/import#file">Importer →</GhostButton>
        <GhostButton href="/import#history">Imports récents →</GhostButton>
      </div>
    </section>
  );
}
