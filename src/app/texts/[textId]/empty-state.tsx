import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";

type ReaderEmptyProps = {
  textTitle: string;
};

function DocumentVisual() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden>
      <path
        d="M8 3.5h5.2L18 8.3V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M13 3.5V9H18" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function ReaderEmptyPage({ textTitle }: ReaderEmptyProps) {
  return (
    <EmptyState
      eyebrow="Reader"
      title={`« ${textTitle} » n'est pas encore prêt`}
      description="Ce texte n'a pas encore de phrases analysées. Relancez l'import ou choisissez un autre texte dans votre bibliothèque."
      visual={<DocumentVisual />}
      action={{ label: "Retour à la bibliothèque", href: "/library" }}
    >
      <Link
        href="/import"
        className="focus-kb mt-4 text-sm font-medium text-[var(--v2-primary,#0058be)] hover:underline"
      >
        Aller à l&apos;import
      </Link>
    </EmptyState>
  );
}
