import Link from "next/link";

import type { TodaysDiscovery } from "@/features/discovery";
import { discoveryMetadataLine } from "@/features/discovery/discovery-metadata";
import {
  todaysDiscoveryEmptyRationale,
  todaysDiscoveryRationale,
} from "@/lib/home/session-rationale";

import { DiscoveryActions } from "@/components/discovery/discovery-actions";

import { HomeSessionCard } from "./home-session-card";

type HomeTodaysDiscoveryProps = {
  discovery: TodaysDiscovery | null;
};

export function HomeTodaysDiscovery({ discovery }: HomeTodaysDiscoveryProps) {
  if (!discovery) {
    return (
      <HomeSessionCard
        label="Découverte du jour"
        rationale={todaysDiscoveryEmptyRationale()}
      >
        <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
          Votre graphe linguistique alimentera ici une découverte contextualisée chaque jour.
        </p>
        <Link
          href="/import"
          className="focus-kb mt-4 inline-block text-sm text-[var(--ink-secondary)] hover:text-[var(--ink)]"
        >
          Importer un texte →
        </Link>
      </HomeSessionCard>
    );
  }

  return (
    <HomeSessionCard label="Découverte du jour" rationale={todaysDiscoveryRationale(discovery)}>
      <h2 className="break-russian font-reader text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] tracking-tight text-[var(--ink)]">
        {discovery.displayLabel}
      </h2>

      <p className="break-russian mt-2 font-reader text-base leading-snug italic text-[var(--ink-secondary)]">
        &ldquo;{discovery.subtitle}&rdquo;
      </p>

      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
        {discoveryMetadataLine(discovery)}
      </p>

      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        {discovery.explanation}
      </p>

      <blockquote className="mt-4 max-w-xl border-l border-[var(--hairline)] pl-4">
        <p className="break-russian font-reader text-base leading-snug text-[var(--ink)]">
          {discovery.exampleRussian}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
          {discovery.exampleTranslation}
        </p>
      </blockquote>

      <DiscoveryActions discovery={discovery} />
    </HomeSessionCard>
  );
}
