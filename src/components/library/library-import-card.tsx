import { GhostButton } from "@/components/design-system";

export function LibraryImportCard() {
  return (
    <section className="library-page-section">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <GhostButton href="/import#paste">Coller</GhostButton>
        <GhostButton href="/import#file">Importer</GhostButton>
        <GhostButton href="/import#history">Imports récents →</GhostButton>
      </div>
    </section>
  );
}
