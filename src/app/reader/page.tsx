import { ReaderEntryRedirect } from "@/components/reader/reader-entry-redirect";
import { SectionHeader } from "@/components/design-system";

export default function ReaderEntryPage() {
  return (
    <div className="pb-8">
      <SectionHeader
        eyebrow="Lecture"
        title="Reprendre la lecture"
        description="Reprenez la dernière session ou choisissez un texte dans la bibliothèque."
      />
      <ReaderEntryRedirect />
    </div>
  );
}
