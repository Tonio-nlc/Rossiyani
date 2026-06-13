import Link from "next/link";

type HomePrimaryActionsProps = {
  srsHref: string;
  readHref: string;
};

export function HomePrimaryActions({ srsHref, readHref }: HomePrimaryActionsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
      <Link
        href={srsHref}
        className="focus-kb inline-flex w-full items-center justify-center bg-[var(--ink)] px-6 py-3 text-sm font-medium text-[var(--paper)] transition hover:opacity-90 sm:w-auto"
      >
        Continue SRS →
      </Link>
      <Link
        href={readHref}
        className="focus-kb inline-flex w-full items-center justify-center border border-[var(--ink)] px-6 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)] sm:w-auto"
      >
        Read a text
      </Link>
    </div>
  );
}
