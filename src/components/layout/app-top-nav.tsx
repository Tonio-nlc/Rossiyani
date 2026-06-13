"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  {
    href: "/reader",
    label: "Reader",
    match: (path: string) => path === "/reader" || path.startsWith("/texts/"),
  },
  {
    href: "/explorer",
    label: "Explorer",
    match: (path: string) => path === "/explorer" || path.startsWith("/explorer/"),
  },
  {
    href: "/practice",
    label: "Practice",
    match: (path: string) => path === "/practice" || path.startsWith("/practice/"),
  },
  {
    href: "/manual",
    label: "Manual",
    match: (path: string) => path === "/manual" || path.startsWith("/manual/"),
  },
  {
    href: "/library",
    label: "Library",
    match: (path: string) => path === "/library" || path.startsWith("/library/"),
  },
] as const;

export function AppTopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <header className="sticky top-0 z-30 border-b border-[var(--hairline)] bg-[var(--paper)]">
      <div className="editorial-shell grid h-[var(--header-height)] grid-cols-[1fr_auto] items-center lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="focus-kb font-reader text-lg font-medium tracking-tight text-[var(--ink)]"
        >
          Rossiyani
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center justify-center gap-6 xl:gap-7 lg:flex"
        >
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "focus-kb text-sm font-medium transition",
                  active
                    ? "text-[var(--ink)]"
                    : "text-[var(--ink-secondary)] hover:text-[var(--ink)]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-3 lg:min-w-[7.5rem]">
          <button
            type="button"
            className="focus-kb px-2 py-1 text-lg leading-none text-[var(--ink-secondary)] lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-main-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id="mobile-main-nav"
          aria-label="Main mobile"
          className="border-t border-[var(--hairline)] lg:hidden"
        >
          <ul className="editorial-shell flex flex-col gap-1 py-3">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "focus-kb block py-2.5 text-sm font-medium transition",
                      active
                        ? "text-[var(--ink)]"
                        : "text-[var(--ink-secondary)] hover:text-[var(--ink)]",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
