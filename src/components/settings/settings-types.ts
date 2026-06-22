export type SettingsSectionId =
  | "reading"
  | "practice"
  | "library"
  | "account"
  | "appearance"
  | "advanced";

export type SettingsField = {
  id: string;
  label: string;
  description: string;
};

export type SettingsCard = {
  id: string;
  title: string;
  description: string;
  fields: SettingsField[];
};

export type SettingsSection = {
  id: SettingsSectionId;
  label: string;
  description: string;
  cards: SettingsCard[];
};
