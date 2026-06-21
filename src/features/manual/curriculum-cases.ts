export const MANUAL_CASE_IDS = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "instrumental",
  "prepositional",
] as const;

export type ManualCaseId = (typeof MANUAL_CASE_IDS)[number];

export type ManualCurriculumCase = {
  id: ManualCaseId;
  name: string;
  description: string;
  keyword: string;
};

export const MANUAL_CURRICULUM_CASES: ManualCurriculumCase[] = [
  {
    id: "nominative",
    name: "Nominative",
    description: "The subject case — who or what performs the action.",
    keyword: "nominatif",
  },
  {
    id: "genitive",
    name: "Genitive",
    description: "Possession, absence, and the realm of «нет» — nothing exists without it.",
    keyword: "génitif",
  },
  {
    id: "dative",
    name: "Dative",
    description: "The indirect object — to whom, for whom, the direction of giving.",
    keyword: "datif",
  },
  {
    id: "accusative",
    name: "Accusative",
    description: "The direct object — what receives the action of the verb.",
    keyword: "accusatif",
  },
  {
    id: "instrumental",
    name: "Instrumental",
    description: "Means and accompaniment — with what, by whom, together with.",
    keyword: "instrumental",
  },
  {
    id: "prepositional",
    name: "Prepositional",
    description: "Location and topic — about what, in what place (always with a preposition).",
    keyword: "prépositionnel",
  },
];

export function isManualCaseId(value: string): value is ManualCaseId {
  return MANUAL_CASE_IDS.includes(value as ManualCaseId);
}

export function getManualCurriculumCase(id: string): ManualCurriculumCase | null {
  return MANUAL_CURRICULUM_CASES.find((item) => item.id === id) ?? null;
}
