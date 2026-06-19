import { SectionHeader } from "@/components/design-system";

type LibraryPageIntroProps = {
  textCount?: number;
  sentenceCount?: number;
};

export function LibraryPageIntro({ textCount, sentenceCount }: LibraryPageIntroProps) {
  const meta =
    textCount !== undefined && sentenceCount !== undefined
      ? `${textCount} texte${textCount === 1 ? "" : "s"} · ${sentenceCount} phrase${sentenceCount === 1 ? "" : "s"}`
      : undefined;

  return (
    <header className="library-page-section pb-0">
      <SectionHeader
        eyebrow="Bibliothèque"
        title="Bibliothèque"
        description="Textes russes analysés mot à mot — une collection éditoriale pour la lecture profonde."
        meta={meta}
      />
    </header>
  );
}
