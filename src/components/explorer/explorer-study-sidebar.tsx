"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type WorkspaceTabId = "definitions" | "etymology" | "usage" | "conjugation";

type NavItem = {
  id: WorkspaceTabId;
  label: string;
  href: string;
};

const WORD_NAV: NavItem[] = [
  { id: "definitions", label: "Lexicon", href: "#definitions" },
  { id: "etymology", label: "Etymology", href: "#etymology" },
  { id: "usage", label: "Usage", href: "#usage" },
  { id: "conjugation", label: "Conjugation", href: "#conjugation" },
];

const WORKSPACE_NAV: NavItem[] = [
  { id: "definitions", label: "Lexicon", href: "/explorer" },
  { id: "etymology", label: "Etymology", href: "/explorer/concepts" },
  { id: "usage", label: "Usage", href: "/explorer/expressions" },
  { id: "conjugation", label: "Conjugation", href: "/explorer/cases" },
];

const LEMMA_WORD_PAGE = /^\/explorer\/lemmas\/[^/]+$/;

function isLemmaWordPage(pathname: string): boolean {
  return LEMMA_WORD_PAGE.test(pathname);
}

function workspaceTabFromPath(pathname: string): WorkspaceTabId {
  if (pathname === "/explorer" || pathname.startsWith("/explorer/lemmas")) {
    return "definitions";
  }
  if (pathname.startsWith("/explorer/concepts")) {
    return "etymology";
  }
  if (pathname.startsWith("/explorer/expressions") || pathname.startsWith("/explorer/collocations")) {
    return "usage";
  }
  if (pathname.startsWith("/explorer/cases") || pathname.startsWith("/explorer/endings")) {
    return "conjugation";
  }
  return "definitions";
}

function NavIcon({ id }: { id: WorkspaceTabId }) {
  const className = "explorer-study-sidebar__icon";
  switch (id) {
    case "definitions":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path d="M3 3.5h10v9H3z" stroke="currentColor" strokeWidth="1.1" />
          <path d="M5.5 6.5h5M5.5 9h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "etymology":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path d="M8 13V5.5M8 5.5C6.2 5.5 4.5 4.2 4.5 2.5S6.2 0 8 0s3.5 1.2 3.5 3.5S9.8 5.5 8 5.5Z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "usage":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path d="M2.5 4h11M2.5 8h8M2.5 12h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path d="M4 2.5h8v11H4z" stroke="currentColor" strokeWidth="1.1" />
          <path d="M6 5.5h4M6 8h4M6 10.5h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
  }
}

export function ExplorerStudySidebar() {
  const pathname = usePathname() ?? "/explorer";
  const wordPage = isLemmaWordPage(pathname);
  const [wordSection, setWordSection] = useState<WorkspaceTabId>("definitions");
  const workspaceTab = workspaceTabFromPath(pathname);

  useEffect(() => {
    if (!wordPage) {
      return;
    }
    const sync = () => {
      const hash = window.location.hash.replace("#", "") as WorkspaceTabId;
      if (WORD_NAV.some((item) => item.id === hash)) {
        setWordSection(hash);
      } else {
        setWordSection("definitions");
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [wordPage]);

  const navItems = wordPage ? WORD_NAV : WORKSPACE_NAV;
  const activeId = wordPage ? wordSection : workspaceTab;

  return (
    <aside className="explorer-study-sidebar" aria-label="Study Tools">
      <div className="explorer-study-sidebar__head">
        <p className="explorer-study-sidebar__title">Study Tools</p>
        <p className="explorer-study-sidebar__subtitle">Deep Lexical Analysis</p>
      </div>

      <nav className="explorer-study-sidebar__nav" aria-label="Workspace">
        {navItems.map((item) => {
          const className = [
            "explorer-study-sidebar__link focus-kb",
            activeId === item.id ? "explorer-study-sidebar__link-active" : "",
          ].join(" ");

          if (wordPage) {
            return (
              <a key={item.id} href={item.href} className={className}>
                <NavIcon id={item.id} />
                <span>{item.label}</span>
              </a>
            );
          }

          return (
            <Link key={item.id} href={item.href} className={className}>
              <NavIcon id={item.id} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="explorer-study-sidebar__footer">
        <Link href="/explorer/lemmas" className="explorer-study-sidebar__archive focus-kb">
          Open Archive
        </Link>
        <div className="explorer-study-sidebar__meta-links">
          <Link href="/settings" className="explorer-study-sidebar__meta-link focus-kb">
            Settings
          </Link>
          <Link href="/explorer" className="explorer-study-sidebar__meta-link focus-kb">
            Support
          </Link>
        </div>
      </div>
    </aside>
  );
}
