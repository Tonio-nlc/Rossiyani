import { EmptyState } from "@/components/design-system";
import type { TextListItem } from "@/features/texts";

import { LibrarySuggestCard } from "./library-suggest-card";
import { LibraryTextCard, type LibraryTextCardVariant } from "./library-text-card";

type LibraryWorkspaceTextGridProps = {
  texts: TextListItem[];
  hasAnyTexts: boolean;
  busyTextId?: string | null;
  removingTextId?: string | null;
  onRename: (text: TextListItem) => void;
  onDelete: (text: TextListItem) => void;
};

function variantForIndex(index: number): LibraryTextCardVariant {
  if (index === 0) {
    return "featured";
  }
  if (index % 5 === 3) {
    return "compact";
  }
  return "standard";
}

function cellClassForVariant(variant: LibraryTextCardVariant): string {
  switch (variant) {
    case "featured":
      return "library-ws-texts__cell--featured";
    case "compact":
      return "library-ws-texts__cell--compact";
    default:
      return "library-ws-texts__cell--standard";
  }
}

export function LibraryWorkspaceTextGrid({
  texts,
  hasAnyTexts,
  busyTextId = null,
  removingTextId = null,
  onRename,
  onDelete,
}: LibraryWorkspaceTextGridProps) {
  if (texts.length === 0 && !hasAnyTexts) {
    return (
      <EmptyState
        eyebrow="Bibliothèque"
        title="Votre bibliothèque est vide"
        description="Importez un texte pour commencer."
        action={{ label: "Importer →", href: "/import" }}
      />
    );
  }

  if (texts.length === 0) {
    return (
      <EmptyState
        eyebrow="Bibliothèque"
        title="Aucun texte ne correspond"
        description="Modifiez les filtres pour élargir votre recherche."
      />
    );
  }

  return (
    <ul className="library-ws-texts">
      {texts.map((text, index) => {
        const variant = variantForIndex(index);
        return (
          <li
            key={text.id}
            className={[
              "library-ws-texts__cell",
              cellClassForVariant(variant),
              removingTextId === text.id ? "animate-fade-out" : "",
            ].join(" ")}
          >
            <LibraryTextCard
              text={text}
              variant={variant}
              disabled={busyTextId === text.id}
              onRename={onRename}
              onDelete={onDelete}
            />
          </li>
        );
      })}

      <li className="library-ws-texts__cell library-ws-texts__cell--standard">
        <LibrarySuggestCard />
      </li>
    </ul>
  );
}
