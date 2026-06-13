import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";

type ReaderEmptyProps = {
  textTitle: string;
};

export default function ReaderEmptyPage({ textTitle }: ReaderEmptyProps) {
  return (
    <EmptyState
      icon="📄"
      title={`« ${textTitle} » n'est pas encore analysé`}
      description="Ce texte n'a pas encore de phrases dans la base. Relancez l'import ou choisissez un autre texte."
      action={{ label: "Retour à la bibliothèque", href: "/library" }}
    >
      <Link href="/import" className="focus-kb mt-3 text-sm text-[var(--accent-violet-bright)] hover:underline">
        Aller à l&apos;import
      </Link>
    </EmptyState>
  );
}
