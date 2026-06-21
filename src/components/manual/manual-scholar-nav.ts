export type ManualScholarNavId =
  | "curriculum"
  | "grammar"
  | "lexicon"
  | "phonetics"
  | "etymology";

export type ManualScholarNavItem = {
  id: ManualScholarNavId;
  label: string;
  href: string;
  themePrefixes: string[];
};

export const MANUAL_SCHOLAR_NAV: ManualScholarNavItem[] = [
  {
    id: "curriculum",
    label: "Curriculum",
    href: "/manual",
    themePrefixes: [],
  },
  {
    id: "grammar",
    label: "Grammar",
    href: "/manual/theme/declensions",
    themePrefixes: [
      "declensions",
      "prepositions",
      "syntax",
      "aspect",
      "motion-verbs",
    ],
  },
  {
    id: "lexicon",
    label: "Lexicon",
    href: "/manual/theme/verbs",
    themePrefixes: [
      "verbs",
      "pronouns",
      "adjectives",
      "numerals",
      "expressions",
      "communication",
    ],
  },
  {
    id: "phonetics",
    label: "Phonetics",
    href: "/manual/theme/pronunciation",
    themePrefixes: ["pronunciation", "alphabet", "accent"],
  },
  {
    id: "etymology",
    label: "Etymology",
    href: "/manual/theme/culture",
    themePrefixes: ["culture", "register"],
  },
];

export function resolveManualScholarNavId(pathname: string): ManualScholarNavId {
  if (pathname === "/manual") {
    return "curriculum";
  }

  if (pathname.startsWith("/manual/niveau/") || pathname.startsWith("/manual/lecons/")) {
    return "curriculum";
  }

  if (pathname.startsWith("/manual/curriculum/")) {
    return "grammar";
  }

  const themeMatch = pathname.match(/^\/manual\/theme\/([^/]+)/);
  if (themeMatch) {
    const theme = themeMatch[1];
    for (const item of MANUAL_SCHOLAR_NAV) {
      if (item.themePrefixes.includes(theme)) {
        return item.id;
      }
    }
  }

  return "curriculum";
}
