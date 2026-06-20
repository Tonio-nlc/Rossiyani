import Link from "next/link";

export function LibraryImportCard() {
  return (
    <section className="library-catalog-suggest" aria-label="Suggérer un texte">
      <p className="library-catalog-suggest-label">Suggérer un texte</p>
      <div className="library-catalog-suggest-actions">
        <Link href="/import#paste" className="library-catalog-suggest-link focus-kb">
          Coller &rarr;
        </Link>
        <Link href="/import#file" className="library-catalog-suggest-link focus-kb">
          Importer &rarr;
        </Link>
        <Link href="/import#history" className="library-catalog-suggest-link focus-kb">
          Imports récents &rarr;
        </Link>
      </div>
    </section>
  );
}
