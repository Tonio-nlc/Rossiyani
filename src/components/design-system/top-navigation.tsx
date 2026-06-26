"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { MAIN_NAV } from "@/lib/navigation/main-nav";

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

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden className="ds-top-nav__menu-icon">
        <path d="M4 4 12 12M12 4 4 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="ds-top-nav__menu-icon">
      <path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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
      <div className="ds-top-nav__inner">
        <Link href="/" className="ds-top-nav__brand focus-kb" aria-label="Rossiyani — Home">
          <span className="ds-top-nav__brand-mark" aria-hidden>
            <span className="ds-top-nav__brand-mark-inner" />
          </span>
          <span className="ds-top-nav__brand-text">Rossiyani</span>
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
              aria-label="Rechercher dans Rossiyani"
            >
              <SearchIcon />
              <span className="ds-top-nav__search-label">Search</span>
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
            <span className="ds-top-nav__profile-avatar" aria-hidden>
              <ProfileIcon />
            </span>
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
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav id="mobile-main-nav" aria-label="Navigation mobile" className="ds-top-nav__mobile">
          <ul className="ds-top-nav__mobile-list">
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
            <li aria-hidden>
              <hr className="ds-top-nav__mobile-divider" />
            </li>
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
                  <span className="ds-top-nav__search-label">Search</span>
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
                <span className="ds-top-nav__profile-avatar" aria-hidden>
                  <ProfileIcon />
                </span>
                <span className="ds-top-nav__profile-label">Profil</span>
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
