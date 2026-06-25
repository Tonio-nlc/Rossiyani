"use client";

import Link from "next/link";

export type LibrarySection = "texts" | "lessons" | "saved" | "phrases" | "discoveries";

type LibrarySectionNavProps = {
  active: LibrarySection;
};

const SECTIONS: Array<{ id: LibrarySection; label: string; href: string }> = [
  { id: "texts", label: "Textes", href: "/library" },
  { id: "lessons", label: "Leçons", href: "/library?section=lessons" },
  { id: "saved", label: "Enregistrés", href: "/library?section=saved" },
  { id: "phrases", label: "Mes phrases", href: "/library?section=phrases" },
  { id: "discoveries", label: "Découvertes", href: "/library?section=discoveries" },
];

export function LibrarySectionNav({ active }: LibrarySectionNavProps) {
  return (
    <nav aria-label="Sections de la bibliothèque" className="library-ws-nav">
      {SECTIONS.map((section) => (
        <Link
          key={section.id}
          href={section.href}
          aria-current={active === section.id ? "page" : undefined}
          className={[
            "library-ws-nav__link focus-kb",
            active === section.id ? "library-ws-nav__link--active" : "",
          ].join(" ")}
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
