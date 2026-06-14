import Link from "next/link";

import type { TodaysDiscovery } from "@/features/discovery";

type ReaderTodaysTargetProps = {
  targets: string[];
  discovery: TodaysDiscovery | null;
};

export function buildReaderTargets(
  text: {
    sentences: Array<{
      russianText: string;
      words: Array<{ lemma: string; case: string | null }>;
      phraseGroups: Array<{ label: string }>;
    }>;
  },
  discovery: TodaysDiscovery | null,
): string[] {
  const targets: string[] = [];
  const seen = new Set<string>();

  const add = (value: string) => {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    targets.push(value.trim());
  };

  if (discovery) {
    const inText = text.sentences.some((sentence) =>
      sentence.russianText.toLowerCase().includes(discovery.displayLabel.toLowerCase()),
    );
    if (inText || discovery.type === "GRAMMAR" || discovery.type === "CONSTRUCTION") {
      add(discovery.displayLabel);
    }
    for (const topic of discovery.topics.slice(0, 2)) {
      add(topic.replace(/_/g, " "));
    }
  }

  for (const sentence of text.sentences) {
    for (const group of sentence.phraseGroups.slice(0, 2)) {
      add(group.label);
      if (targets.length >= 5) {
        break;
      }
    }
    if (targets.length >= 5) {
      break;
    }
  }

  const cases = new Set<string>();
  for (const sentence of text.sentences) {
    for (const word of sentence.words) {
      if (word.case && word.case !== "nominative") {
        cases.add(word.case);
      }
    }
  }
  for (const caseName of [...cases].slice(0, 1)) {
    add(`${caseName} case`);
  }

  return targets.slice(0, 4);
}

export function ReaderTodaysTarget({ targets, discovery }: ReaderTodaysTargetProps) {
  if (targets.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-5 py-4">
      <p className="home-section-label">Today&apos;s target</p>
      <p className="mt-3 text-sm text-[var(--ink-secondary)]">Learn:</p>
      <ul className="mt-2 space-y-1.5">
        {targets.map((target) => (
          <li key={target} className="flex items-center gap-2 font-reader text-base text-[var(--ink)]">
            <span className="text-[var(--ink-muted)]" aria-hidden>
              ✓
            </span>
            {discovery && target === discovery.displayLabel && discovery.explorerHref ? (
              <Link
                href={discovery.explorerHref}
                className="focus-kb hover:text-[var(--color-link)]"
              >
                {target}
              </Link>
            ) : (
              target
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
