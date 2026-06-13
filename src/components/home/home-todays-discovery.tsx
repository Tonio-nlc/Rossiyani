import type { TodaysDiscovery } from "@/features/discovery";

import { DiscoveryActions } from "@/components/discovery/discovery-actions";

type HomeTodaysDiscoveryProps = {
  discovery: TodaysDiscovery;
};

export function HomeTodaysDiscovery({ discovery }: HomeTodaysDiscoveryProps) {
  return (
    <section className="flex min-h-[calc(100dvh-var(--header-height)-2rem)] flex-col justify-center py-[var(--layout-gap)]">
      <p className="home-section-label">Today&apos;s discovery</p>

      <h1 className="break-russian mt-8 font-reader text-[clamp(3rem,8vw,3.75rem)] leading-[0.95] tracking-tight text-[var(--ink)]">
        {discovery.displayLabel}
      </h1>

      <p className="break-russian mt-5 font-reader text-[clamp(1.25rem,2.5vw,1.5rem)] italic text-[var(--ink-secondary)]">
        &ldquo;{discovery.subtitle}&rdquo;
      </p>

      <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--ink-secondary)]">
        {discovery.explanation}
      </p>

      <figure className="mt-8 max-w-xl">
        <p className="break-russian font-reader text-[clamp(1rem,2vw,1.125rem)] leading-relaxed text-[var(--ink)]">
          {discovery.exampleRussian}
        </p>
        <figcaption className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
          {discovery.exampleTranslation}
        </figcaption>
      </figure>

      <DiscoveryActions discovery={discovery} />
    </section>
  );
}
