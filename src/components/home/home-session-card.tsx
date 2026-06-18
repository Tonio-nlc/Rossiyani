import Link from "next/link";

type HomeSessionCardProps = {
  label: string;
  rationale: string;
  children: React.ReactNode;
  href?: string;
  cta?: string;
  /** Emphasizes the primary next action in the session thread. */
  primary?: boolean;
};

export function HomeSessionCard({
  label,
  rationale,
  children,
  href,
  cta,
  primary = false,
}: HomeSessionCardProps) {
  const shellClass = [
    "block transition",
    primary
      ? "border border-[var(--ink)] bg-[var(--paper)]"
      : "border border-[var(--hairline)] hover:border-[var(--hairline-strong)]",
    href ? "focus-kb group" : "",
  ].join(" ");

  const inner = (
    <>
      <p className="home-section-label">{label}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-muted)]">{rationale}</p>
      <div className="mt-4 min-w-0">{children}</div>
      {cta ? (
        <p
          className={[
            "mt-4 text-sm",
            href
              ? "text-[var(--ink-secondary)] group-hover:text-[var(--color-link)]"
              : "text-[var(--ink-secondary)]",
          ].join(" ")}
        >
          {cta}
        </p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} prefetch className={shellClass + " px-6 py-6"}>
        {inner}
      </Link>
    );
  }

  return <article className={shellClass + " px-6 py-6"}>{inner}</article>;
}
