import Link from "next/link";

const LINKS = [
  { href: "/reader", label: "Reader", description: "Deep read with annotations" },
  { href: "/explorer", label: "Explorer", description: "Browse the knowledge graph" },
  { href: "/practice", label: "Practice", description: "Write and refine Russian" },
  { href: "/library", label: "Library", description: "Your texts and saved work" },
] as const;

export function HomeQuickAccess() {
  return (
    <section>
      <p className="home-section-label">Quick access</p>

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="focus-kb group block border border-[var(--hairline)] px-4 py-4 transition hover:border-[var(--hairline-strong)]"
            >
              <p className="font-reader text-base text-[var(--ink)] group-hover:text-[var(--color-link)]">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">{item.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
