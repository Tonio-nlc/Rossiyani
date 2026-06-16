"use client";

import Link from "next/link";

export type LibrarySection = "texts" | "lessons" | "saved" | "phrases" | "discoveries";

type LibrarySectionNavProps = {
  active: LibrarySection;
};

const SECTIONS: Array<{ id: LibrarySection; label: string; href: string }> = [
  { id: "texts", label: "Texts", href: "/library" },
  { id: "lessons", label: "Lessons", href: "/library?section=lessons" },
  { id: "saved", label: "Saved", href: "/library?section=saved" },
  { id: "phrases", label: "My phrases", href: "/library?section=phrases" },
  { id: "discoveries", label: "My discoveries", href: "/library?section=discoveries" },
];

export function LibrarySectionNav({ active }: LibrarySectionNavProps) {
  return (
    <nav aria-label="Library sections" className="flex flex-wrap gap-x-8 gap-y-2 border-b border-[var(--hairline)] pb-4">
      {SECTIONS.map((section) => (
        <Link
          key={section.id}
          href={section.href}
          aria-current={active === section.id ? "page" : undefined}
          className={[
            "focus-kb text-sm font-medium transition",
            active === section.id
              ? "text-[var(--ink)]"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink)]",
          ].join(" ")}
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
