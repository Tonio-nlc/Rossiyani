import Link from "next/link";
import type { ReactNode } from "react";

import type { VocabularyTab } from "@/lib/vocabulary";

type VocabularyFicheLinkProps = {
  href: string;
  tone: VocabularyTab;
  children: ReactNode;
  className?: string;
};

export function VocabularyFicheLink({ href, tone, children, className = "" }: VocabularyFicheLinkProps) {
  return (
    <Link
      href={href}
      className={[
        "vocabulary-fiche",
        `vocabulary-fiche--${tone}`,
        "focus-kb",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
      <span className="vocabulary-fiche__shine" aria-hidden />
    </Link>
  );
}
