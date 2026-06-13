import type { CaseKey } from "./case-styles";

export type CaseLegendEntry = {
  key: CaseKey;
  shortLabel: string;
  frenchName: string;
  question: string;
  typicalEndings: string[];
  examples: string[];
  frenchContrast: string;
};

/** Interactive case legend — French pedagogical content. */
export const CASE_LEGEND_ENTRIES: CaseLegendEntry[] = [
  {
    key: "nominative",
    shortLabel: "Nom.",
    frenchName: "Nominatif",
    question: "Qui ? Quoi ? (sujet)",
    typicalEndings: ["∅", "а", "я", "о", "и"],
    examples: ["город", "зима", "дом"],
    frenchContrast:
      "Comme le sujet français sans préposition : le russe marque parfois le nominatif avec des terminaisons.",
  },
  {
    key: "genitive",
    shortLabel: "Gén.",
    frenchName: "Génitif",
    question: "De qui ? De quoi ?",
    typicalEndings: ["а", "я", "ы", "ей", "ов"],
    examples: ["города", "зимы", "дома"],
    frenchContrast:
      "Souvent rendu par « de » en français ; le russe marque la relation sur le nom, pas avec une préposition seule.",
  },
  {
    key: "dative",
    shortLabel: "Dat.",
    frenchName: "Datif",
    question: "À qui ? À quoi ?",
    typicalEndings: ["у", "ю", "е", "ам"],
    examples: ["городу", "зиме", "другу"],
    frenchContrast:
      "Proche de « à » pour le destinataire ; le russe fléchit le nom, le français utilise surtout des prépositions.",
  },
  {
    key: "accusative",
    shortLabel: "Acc.",
    frenchName: "Accusatif",
    question: "Qui ? Quoi ? (complément)",
    typicalEndings: ["∅", "у", "ю", "а", "я"],
    examples: ["город", "зиму", "дом"],
    frenchContrast:
      "Objet direct sans préposition en français ; le russe change la forme du nom selon l'animé et le genre.",
  },
  {
    key: "instrumental",
    shortLabel: "Instr.",
    frenchName: "Instrumental",
    question: "Avec qui ? Avec quoi ? Comment ?",
    typicalEndings: ["ом", "ем", "ой", "ей", "ами"],
    examples: ["городом", "машиной", "зимой"],
    frenchContrast:
      "Souvent « avec » ou « par » en français ; terminaisons comme -ой, -ом sont très typiques.",
  },
  {
    key: "prepositional",
    shortLabel: "Loc.",
    frenchName: "Locatif / prépositionnel",
    question: "Où ? Sur quoi ? À propos de quoi ?",
    typicalEndings: ["е", "и", "у"],
    examples: ["городке", "зиме", "доме"],
    frenchContrast:
      "Après в, на, о… le russe impose une forme en -е ; le français dit « dans / sur » sans marquer le cas sur le nom.",
  },
];

export function getCaseLegendEntry(key: CaseKey): CaseLegendEntry | undefined {
  return CASE_LEGEND_ENTRIES.find((e) => e.key === key);
}
