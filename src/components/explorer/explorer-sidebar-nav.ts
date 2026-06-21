export type ExplorerSidebarCategoryId =
  | "lemmas"
  | "concepts"
  | "cases"
  | "endings"
  | "collocations"
  | "expressions";

export type ExplorerSidebarNavItem = {
  id: ExplorerSidebarCategoryId;
  label: string;
  href: string;
  match: (pathname: string) => boolean;
};

export const EXPLORER_SIDEBAR_NAV: ExplorerSidebarNavItem[] = [
  {
    id: "lemmas",
    label: "Lemmas",
    href: "/explorer/lemmas",
    match: (pathname) => pathname.startsWith("/explorer/lemmas"),
  },
  {
    id: "concepts",
    label: "Concepts",
    href: "/explorer/concepts",
    match: (pathname) => pathname.startsWith("/explorer/concepts"),
  },
  {
    id: "cases",
    label: "Cases",
    href: "/explorer/cases",
    match: (pathname) => pathname.startsWith("/explorer/cases"),
  },
  {
    id: "endings",
    label: "Endings",
    href: "/explorer/endings",
    match: (pathname) => pathname.startsWith("/explorer/endings"),
  },
  {
    id: "collocations",
    label: "Collocations",
    href: "/explorer/collocations",
    match: (pathname) =>
      pathname.startsWith("/explorer/collocations"),
  },
  {
    id: "expressions",
    label: "Expressions",
    href: "/explorer/expressions",
    match: (pathname) => pathname.startsWith("/explorer/expressions"),
  },
];

export function activeExplorerSidebarCategory(
  pathname: string,
): ExplorerSidebarCategoryId | null {
  const item = EXPLORER_SIDEBAR_NAV.find((entry) => entry.match(pathname));
  return item?.id ?? null;
}
