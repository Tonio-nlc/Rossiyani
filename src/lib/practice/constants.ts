export const PRACTICE_SUGGESTIONS = [
  { label: "Describe your morning", context: "Describe your morning routine" },
  { label: "Explain why you like coffee", context: "Explain why you like coffee" },
  { label: "Talk about yesterday", context: "Talk about what you did yesterday" },
  { label: "Express a future plan", context: "Express a plan for the near future" },
  { label: "Use: несмотря на", context: "Use the structure: несмотря на" },
] as const;

export type PracticeModeId = "sentence" | "context-translation" | "my-sentences";

export type PracticeModeCard = {
  id: PracticeModeId;
  title: string;
  description: string;
  href: string;
};

export const PRACTICE_MODE_CARDS: PracticeModeCard[] = [
  {
    id: "sentence",
    title: "Constructeur de phrases",
    description: "Reconstituez et composez des phrases russes à partir de vos textes.",
    href: "/practice?mode=sentence",
  },
  {
    id: "context-translation",
    title: "Traduction contextualisée",
    description: "Traduisez le sens, pas des mots isolés.",
    href: "/practice/context-translation",
  },
  {
    id: "my-sentences",
    title: "Mes phrases",
    description: "Pratiquez uniquement les phrases enregistrées en lecture.",
    href: "/practice/my-sentences",
  },
];

export function practicePath(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value?.trim()) {
      search.set(key, value.trim());
    }
  }
  const query = search.toString();
  return query ? `/practice?${query}` : "/practice";
}

export function contextTranslationPath(lessonId?: string): string {
  return lessonId
    ? `/practice/context-translation?lesson=${encodeURIComponent(lessonId)}`
    : "/practice/context-translation";
}
