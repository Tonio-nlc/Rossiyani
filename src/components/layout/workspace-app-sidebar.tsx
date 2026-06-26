"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    shortLabel: "Home",
    match: (path: string) => path === "/",
    icon: HomeIcon,
  },
  {
    href: "/library",
    label: "Library",
    shortLabel: "Library",
    match: (path: string) => path === "/library" || path.startsWith("/library/"),
    icon: LibraryIcon,
  },
  {
    href: "/reader",
    label: "Reader",
    shortLabel: "Read",
    match: (path: string) => path === "/reader" || path.startsWith("/texts/"),
    icon: ReaderIcon,
  },
  {
    href: "/library?section=discoveries",
    label: "Vocabulary",
    shortLabel: "Words",
    match: (path: string) => path.includes("section=discoveries"),
    icon: VocabularyIcon,
  },
  {
    href: "/lessons",
    label: "Lessons",
    shortLabel: "Lessons",
    match: (path: string) => path === "/lessons" || path.startsWith("/lessons/"),
    icon: ManualIcon,
  },
] as const;

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-nav__icon">
      <path
        d="M3.5 8.5 10 3.5l6.5 5v7.5H12.5V11h-5v5H3.5V8.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-nav__icon">
      <path
        d="M4 4.5h5v11H4a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5Zm7 0h5a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5h-5V4.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function ReaderIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-nav__icon">
      <path
        d="M5.5 4.5h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M7 8h6M7 10.5h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function VocabularyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-nav__icon">
      <path
        d="M6 5.5h8M6 8.5h8M6 11.5h5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect x="4.5" y="3.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ManualIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="reader-ws-nav__icon">
      <path
        d="M6 4.5h8v11H6a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 6 4.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M8.5 4.5v11M11 8h4M11 10.5h4M11 13h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function WorkspaceAppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="reader-ws-nav" aria-label="Application navigation">
      <div className="reader-ws-nav__brand">
        <Link href="/" className="reader-ws-nav__logo focus-kb">
          Rossiyani
        </Link>
      </div>
      <nav className="reader-ws-nav__list">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={["reader-ws-nav__link focus-kb", active ? "reader-ws-nav__link--active" : ""]
                .filter(Boolean)
                .join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <item.icon />
              <span className="reader-ws-nav__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
