export type ComposeMode = "translation" | "reformulation" | "free" | "post_reading";

export type ComposeModeCard = {
  id: ComposeMode;
  title: string;
  description: string;
  eyebrow: string;
};

export const COMPOSE_MODE_CARDS: ComposeModeCard[] = [
  {
    id: "translation",
    eyebrow: "Mode 1",
    title: "Traduction",
    description: "Une phrase en français — vous la traduisez en russe. Analyse complète ensuite.",
  },
  {
    id: "reformulation",
    eyebrow: "Mode 2",
    title: "Reformulation",
    description: "Une phrase russe de référence — trouvez une autre formulation naturelle.",
  },
  {
    id: "free",
    eyebrow: "Mode 3",
    title: "Rédaction libre",
    description: "Écrivez librement. Compose analyse grammaire, vocabulaire et naturel.",
  },
  {
    id: "post_reading",
    eyebrow: "Mode 4",
    title: "Après lecture",
    description: "Exercices générés à partir de vos textes terminés et du vocabulaire rencontré.",
  },
];

export function isComposeMode(value: string | null): value is ComposeMode {
  return COMPOSE_MODE_CARDS.some((mode) => mode.id === value);
}

export function composeModeLabel(mode: ComposeMode): string {
  return COMPOSE_MODE_CARDS.find((entry) => entry.id === mode)?.title ?? "Compose";
}
