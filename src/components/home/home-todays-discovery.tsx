import Image from "next/image";

import type { TodaysDiscovery } from "@/features/discovery";
import { discoveryMetadataLine } from "@/features/discovery/discovery-metadata";

import { DiscoveryActions } from "@/components/discovery/discovery-actions";

type HomeTodaysDiscoveryProps = {
  discovery: TodaysDiscovery | null;
};

function HeroIllustration() {
  return (
    <div className="hidden min-w-0 lg:flex lg:items-center lg:justify-start" aria-hidden>
      <Image
        src="/illustrations/hero_image.png"
        alt=""
        width={2338}
        height={1474}
        priority
        className="h-auto w-full max-w-[620px] object-contain"
        sizes="(min-width: 1024px) 620px, 0px"
      />
    </div>
  );
}

function HeroContainer({ children }: { children: React.ReactNode }) {
  return (
    <section className="pb-16 pt-[var(--space-4)]">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        {children}
      </div>
    </section>
  );
}

export function HomeTodaysDiscovery({ discovery }: HomeTodaysDiscoveryProps) {
  if (!discovery) {
    return (
      <HeroContainer>
        <div className="min-w-0">
          <p className="home-section-label">Today&apos;s discovery</p>
          <p className="mt-3 font-reader text-lg leading-relaxed text-[var(--ink-secondary)]">
            Import a text to populate your learning graph and unlock daily discoveries.
          </p>
        </div>
        <HeroIllustration />
      </HeroContainer>
    );
  }

  return (
    <HeroContainer>
      <div className="min-w-0">
        <p className="home-section-label">Today&apos;s discovery</p>

        <h1 className="break-russian mt-3 font-reader text-[clamp(4rem,7vw,6rem)] leading-[1.05] tracking-tight text-[var(--ink)]">
          {discovery.displayLabel}
        </h1>

        <p className="break-russian mt-3 font-reader text-[clamp(1.125rem,2.5vw,1.375rem)] leading-snug italic text-[var(--ink-secondary)]">
          &ldquo;{discovery.subtitle}&rdquo;
        </p>

        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
          {discoveryMetadataLine(discovery)}
        </p>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ink-secondary)]">
          {discovery.explanation}
        </p>

        <blockquote className="mt-4 max-w-xl border-l border-[var(--hairline)] pl-4">
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
    </HeroContainer>
  );
}
