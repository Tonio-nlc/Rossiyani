import { GhostButton, SectionHeader } from "@/components/design-system";

export function LibraryImportCard() {
  return (
    <section className="library-page-section">
      <SectionHeader
        eyebrow="Import"
        title="Ajouter un texte"
        description="Créez une expérience de lecture interactive à partir de votre propre contenu."
      />
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <GhostButton href="/import#paste">Coller un texte</GhostButton>
        <GhostButton href="/import#file">Importer un fichier</GhostButton>
        <GhostButton href="/import#history">Imports récents →</GhostButton>
      </div>
    </section>
  );
}
