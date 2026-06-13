import { Chapter, EditorialTitle } from "@/components/editorial";
import { ReaderEntryRedirect } from "@/components/reader/reader-entry-redirect";

export default function ReaderEntryPage() {
  return (
    <Chapter className="pt-[var(--space-4)]">
      <EditorialTitle variant="page">Reader</EditorialTitle>
      <p className="editorial-intro mt-4">
        Reprendre la dernière lecture ou choisir un texte dans la bibliothèque.
      </p>
      <div className="mt-8">
        <ReaderEntryRedirect />
      </div>
    </Chapter>
  );
}
