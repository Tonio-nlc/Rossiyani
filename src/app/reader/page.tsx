import { SectionHeader } from "@/components/design-system";
import { ReaderEntryRedirect } from "@/components/reader/reader-entry-redirect";

export default function ReaderEntryPage() {
  return (
    <div className="pb-8">
      <SectionHeader title="Lecture" />
      <ReaderEntryRedirect />
    </div>
  );
}
