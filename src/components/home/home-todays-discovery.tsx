import Image from "next/image";

import type { TodaysDiscovery } from "@/features/discovery";
import { discoveryMetadataLine } from "@/features/discovery/discovery-metadata";

import { DiscoveryActions } from "@/components/discovery/discovery-actions";

type HomeTodaysDiscoveryProps = {
  discovery: TodaysDiscovery | null;
};

function HeroIllustration() {
  return (
    <div
      className="hidden shrink-0 lg:flex lg:items-center lg:justify-end"
      aria-hidden
    >
      <Image
        src="/illustrations/hero_image.png"
        alt=""
        width={2338}
        height={1474}
        priority
        className="h-auto max-h-[650px] w-full max-w-[min(520px,100%)] object-contain"
        sizes="(min-width: 1024px) 520px, 0px"
      />
    </div>
  );
}

export function HomeTodaysDiscovery({ discovery }: HomeTodaysDiscoveryProps) {
  if (!discovery) {
    return (
      <section className="pt-[var(--space-4)]">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
          <div className="min-w-0">
            <p className="home-section-label">Today&apos;s discovery</p>
            <p className="mt-3 font-reader text-lg text-[var(--ink-secondary)]">
              Import a text to populate your learning graph and unlock daily discoveries.
            </p>
          </div>
          <HeroIllustration />
        </div>
      </section>
    );
  }

  return (
    <section className="pt-[var(--space-4)]">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
        <div className="min-w-0">
          <p className="home-section-label">Today&apos;s discovery</p>

          <h1 className="break-russian mt-3 font-reader text-[clamp(3rem,8vw,6rem)] leading-[0.98] tracking-tight text-[var(--ink)]">
            {discovery.displayLabel}
          </h1>

          <p className="break-russian mt-3 font-reader text-[clamp(1.125rem,2.5vw,1.375rem)] italic text-[var(--ink-secondary)]">
            &ldquo;{discovery.subtitle}&rdquo;
          </p>

          <p className="mt-2 text-sm text-[var(--ink-muted)]">{discoveryMetadataLine(discovery)}</p>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
            {discovery.explanation}
          </p>

          <blockquote className="mt-5 max-w-xl border-l border-[var(--hairline)] pl-4">
            <p className="break-russian font-reader text-[clamp(1rem,2vw,1.125rem)] leading-snug text-[var(--ink)]">
              {discovery.exampleRussian}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-secondary)]">
              {discovery.exampleTranslation}
            </p>
          </blockquote>

          <DiscoveryActions discovery={discovery} />
        </div>
        <HeroIllustration />
      </div>
    </section>
  );
}
