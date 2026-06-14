import Link from "next/link";

import type { TodaysDiscovery } from "@/features/discovery";

type ReaderTodaysTargetProps = {
  targets: string[];
  discovery: TodaysDiscovery | null;
  estimatedMinutes: number;
};

export function buildReaderTargets(
  text: {
    level: string;
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

  if (["A1", "A2", "B1"].includes(text.level)) {
    add("conversation vocabulary");
  }

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

export function ReaderTodaysTarget({
  targets,
  discovery,
  estimatedMinutes,
}: ReaderTodaysTargetProps) {
  if (targets.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-[var(--hairline)] pt-4">
      <p className="home-section-label">Today&apos;s target</p>
      <p className="mt-3 text-xs text-[var(--ink-muted)]">
        <span aria-hidden>✓ </span>
        Learn:
      </p>
      <ul className="mt-2 space-y-1">
        {targets.map((target) => (
          <li key={target} className="flex gap-2 text-sm text-[var(--ink-secondary)]">
            <span className="text-[var(--ink-muted)]" aria-hidden>
              –
            </span>
            {discovery && target === discovery.displayLabel && discovery.explorerHref ? (
              <Link
                href={discovery.explorerHref}
                className="focus-kb break-russian font-reader text-[var(--ink)] underline-offset-2 hover:underline"
              >
                {target}
              </Link>
            ) : (
              <span className="break-russian font-reader text-[var(--ink)]">{target}</span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[var(--ink-muted)]">
        Estimated reading: {Math.max(1, estimatedMinutes)} min
      </p>
    </section>
  );
}
