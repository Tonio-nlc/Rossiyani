export type CategoryId =
  | "articles"
  | "dialogues"
  | "contes"
  | "telegram"
  | "actualites";

export type Category = {
  id: CategoryId;
  label: string;
  order: number;
};
