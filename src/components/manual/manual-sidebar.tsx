"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  MANUAL_SCHOLAR_NAV,
  resolveManualScholarNavId,
  type ManualScholarNavId,
} from "./manual-scholar-nav";

function NavIcon({ id }: { id: ManualScholarNavId }) {
  switch (id) {
    case "curriculum":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className="manual-scholar-nav__icon">
          <path d="M4 4.5h12M4 8h12M4 11.5h8M4 15h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "grammar":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className="manual-scholar-nav__icon">
          <path d="M6 3.5v13M14 3.5v13M6 7.5h8M6 12.5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "lexicon":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className="manual-scholar-nav__icon">
          <path d="M5 4.5h7a2 2 0 0 1 2 2v9H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9 4.5V16" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "phonetics":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className="manual-scholar-nav__icon">
          <path d="M3.5 10h2l2-5 3 10 2-6 1.5 4H16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "etymology":
      return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className="manual-scholar-nav__icon">
          <path d="M10 16.5V6M10 6c-2.2 0-4-1.6-4-3.5S7.8 2 10 2s4 1.1 4 3.5S12.2 6 10 6Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M6.5 16.5h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
  }
}

export function ManualSidebar() {
  const pathname = usePathname();
  const activeId = resolveManualScholarNavId(pathname);

  return (
    <aside className="manual-scholar__sidebar" aria-label="Navigation du manuel">
      <div className="manual-scholar__sidebar-head">
        <p className="manual-scholar__sidebar-title">Manuel</p>
        <p className="manual-scholar__sidebar-subtitle">Russian Linguistics</p>
      </div>

      <nav className="manual-scholar-nav">
        {MANUAL_SCHOLAR_NAV.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={[
              "manual-scholar-nav__link focus-kb",
              activeId === item.id ? "manual-scholar-nav__link-active" : "",
            ].join(" ")}
            aria-current={activeId === item.id ? "page" : undefined}
          >
            <NavIcon id={item.id} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <Link href="/practice" className="manual-scholar__deep-study focus-kb">
        Deep Study
      </Link>
    </aside>
  );
}
