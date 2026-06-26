export type MainNavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
};

/** Official Rossiyani primary navigation — do not add entries without product review. */
export const MAIN_NAV: MainNavItem[] = [
  {
    href: "/",
    label: "Home",
    match: (path) => path === "/",
  },
  {
    href: "/library",
    label: "Library",
    match: (path) => path === "/library" || path.startsWith("/library/"),
  },
  {
    href: "/reader",
    label: "Reader",
    match: (path) => path === "/reader" || path.startsWith("/texts/"),
  },
  {
    href: "/vocabulary",
    label: "Vocabulary",
    match: (path) => path === "/vocabulary" || path.startsWith("/vocabulary/"),
  },
  {
    href: "/lessons",
    label: "Lessons",
    match: (path) => path === "/lessons" || path.startsWith("/lessons/"),
  },
  {
    href: "/practice",
    label: "Practice",
    match: (path) => path === "/practice" || path.startsWith("/practice/"),
  },
];

export const NAV_KEYBOARD_SHORTCUTS = [
  { href: "/", shortcut: "0" },
  { href: "/library", shortcut: "1" },
  { href: "/reader", shortcut: "2" },
  { href: "/vocabulary", shortcut: "3" },
  { href: "/lessons", shortcut: "4" },
  { href: "/practice", shortcut: "5" },
] as const;
