import { GhostButton, PrimaryButton } from "@/components/design-system";

export function LibraryImportCard() {
  return (
    <section className="library-page-section">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <PrimaryButton href="/import#paste">Coller un texte</PrimaryButton>
        <PrimaryButton href="/import#file">Importer</PrimaryButton>
        <GhostButton href="/import#history">Imports récents →</GhostButton>
      </div>
    </section>
  );
}
