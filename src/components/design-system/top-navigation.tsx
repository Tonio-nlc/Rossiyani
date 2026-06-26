"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MAIN_NAV = [
  {
    href: "/library",
    label: "Bibliothèque",
    match: (path: string) => path === "/library" || path.startsWith("/library/"),
  },
  {
    href: "/reader",
    label: "Lecture",
    match: (path: string) => path === "/reader" || path.startsWith("/texts/"),
  },
  {
    href: "/explorer",
    label: "Explorer",
    match: (path: string) => path === "/explorer" || path.startsWith("/explorer/"),
  },
  {
    href: "/practice",
    label: "Pratique",
    match: (path: string) => path === "/practice" || path.startsWith("/practice/"),
  },
  {
    href: "/lessons",
    label: "Leçons",
    match: (path: string) => path === "/lessons" || path.startsWith("/lessons/"),
  },
] as const;

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="ds-top-nav__search-icon">
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.25 10.25 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="ds-top-nav__profile-icon">
      <circle cx="8" cy="5.5" r="2.25" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M3.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function navLinkClass(active: boolean, mobile = false) {
  return [
    "ds-top-nav__link focus-kb",
    mobile ? "ds-top-nav__link--mobile" : "",
    active ? "ds-top-nav__link--active" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

type TopNavigationProps = {
  onOpenSearch?: () => void;
};

export function TopNavigation({ onOpenSearch }: TopNavigationProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileActive = pathname === "/settings" || pathname.startsWith("/settings/");

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [mobileOpen]);

  return (
    <header className="ds-top-nav">
      <div className="ds-top-nav__inner ds-editorial-container">
        <Link href="/" className="ds-top-nav__brand focus-kb">
          Rossiyani
        </Link>

        <nav aria-label="Navigation principale" className="ds-top-nav__nav">
          {MAIN_NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={navLinkClass(active)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ds-top-nav__tools">
          {onOpenSearch ? (
            <button
              type="button"
              onClick={onOpenSearch}
              className="ds-top-nav__search focus-kb"
              aria-label="Rechercher"
            >
              <SearchIcon />
              <span className="ds-top-nav__search-label">Rechercher</span>
              <kbd className="ds-top-nav__search-kbd" aria-hidden>
                /
              </kbd>
            </button>
          ) : null}

          <Link
            href="/settings"
            aria-current={profileActive ? "page" : undefined}
            className={[
              "ds-top-nav__profile focus-kb",
              profileActive ? "ds-top-nav__profile--active" : "",
            ].join(" ")}
            aria-label="Profil et préférences"
          >
            <ProfileIcon />
            <span className="ds-top-nav__profile-label">Profil</span>
          </Link>

          <button
            type="button"
            className="ds-top-nav__menu-toggle focus-kb"
            aria-expanded={mobileOpen}
            aria-controls="mobile-main-nav"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="ds-top-nav__menu-icon" aria-hidden>
              {mobileOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id="mobile-main-nav"
          aria-label="Navigation mobile"
          className="ds-top-nav__mobile"
        >
          <ul className="ds-top-nav__mobile-list ds-editorial-container">
            {MAIN_NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={navLinkClass(active, true)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {onOpenSearch ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenSearch();
                  }}
                  className="ds-top-nav__search ds-top-nav__search--mobile focus-kb"
                >
                  <SearchIcon />
                  <span>Rechercher</span>
                </button>
              </li>
            ) : null}
            <li>
              <Link
                href="/settings"
                aria-current={profileActive ? "page" : undefined}
                className={[
                  "ds-top-nav__profile ds-top-nav__profile--mobile focus-kb",
                  profileActive ? "ds-top-nav__profile--active" : "",
                ].join(" ")}
              >
                <ProfileIcon />
                <span>Profil</span>
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
