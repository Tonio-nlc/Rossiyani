"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  activeExplorerSidebarCategory,
  EXPLORER_SIDEBAR_NAV,
  type ExplorerSidebarCategoryId,
} from "./explorer-sidebar-nav";

function NavIcon({ id }: { id: ExplorerSidebarCategoryId }) {
  const className = "explorer-study-sidebar__icon";
  switch (id) {
    case "lemmas":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path d="M3 3.5h10v9H3z" stroke="currentColor" strokeWidth="1.1" />
          <path d="M5.5 6.5h5M5.5 9h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "concepts":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.1" />
          <path d="M8 4.5v7M5 8h6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "cases":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path d="M4 3.5h8l1.5 4.5L8 14 2.5 8z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "endings":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path d="M3 8h7M10 6l3 2-3 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case "collocations":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path d="M3.5 6.5h4v4h-4zM8.5 5.5h4v4h-4z" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path d="M2.5 4h11M2.5 8h8M2.5 12h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
  }
}

export function ExplorerStudySidebar() {
  const pathname = usePathname() ?? "/explorer";
  const activeId = activeExplorerSidebarCategory(pathname);

  return (
    <aside className="explorer-study-sidebar" aria-label="Explorer">
      <div className="explorer-study-sidebar__head">
        <p className="explorer-study-sidebar__title">Explorer</p>
      </div>

      <nav className="explorer-study-sidebar__nav" aria-label="Categories">
        {EXPLORER_SIDEBAR_NAV.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={[
              "explorer-study-sidebar__link focus-kb",
              activeId === item.id ? "explorer-study-sidebar__link-active" : "",
            ].join(" ")}
          >
            <NavIcon id={item.id} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
