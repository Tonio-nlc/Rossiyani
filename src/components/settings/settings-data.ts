import type { SettingsSection, SettingsSectionId } from "./settings-types";

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "reading",
    label: "Reading",
    description: "Typography, translation display and audio for the Reader workspace.",
    cards: [
      {
        id: "typography",
        title: "Typography",
        description: "Control how Russian text appears on the page.",
        fields: [
          {
            id: "font-scale",
            label: "Text size",
            description: "Adjust the Reader body size for comfortable long-form reading.",
          },
          {
            id: "font-family",
            label: "Typeface",
            description: "Choose between editorial serif and system sans for annotations.",
          },
        ],
      },
      {
        id: "line-spacing",
        title: "Line spacing",
        description: "Rhythm and paragraph density in reading mode.",
        fields: [
          {
            id: "paragraph-spacing",
            label: "Paragraph spacing",
            description: "Wider or tighter gaps between sentence blocks.",
          },
          {
            id: "line-height",
            label: "Line height",
            description: "Vertical rhythm for multi-line Russian passages.",
          },
        ],
      },
      {
        id: "translation",
        title: "Translation visibility",
        description: "When and how translations appear alongside Russian.",
        fields: [
          {
            id: "translation-mode",
            label: "Display mode",
            description: "Show translations on demand, per sentence, or inline.",
          },
          {
            id: "translation-language",
            label: "Preferred language",
            description: "Default language for sentence-level glosses.",
          },
        ],
      },
      {
        id: "audio",
        title: "Audio preferences",
        description: "Listening support during immersive reading.",
        fields: [
          {
            id: "playback-speed",
            label: "Playback speed",
            description: "Default speed for sentence audio when available.",
          },
          {
            id: "auto-play",
            label: "Auto-play",
            description: "Play audio automatically when selecting a sentence.",
          },
        ],
      },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    description: "Exercise behaviour and review cadence across practice modes.",
    cards: [
      {
        id: "exercise",
        title: "Exercise behaviour",
        description: "How exercises respond during sentence building and translation.",
        fields: [
          {
            id: "hint-level",
            label: "Hint level",
            description: "How much scaffolding appears before validation.",
          },
          {
            id: "strictness",
            label: "Answer strictness",
            description: "Tolerance for punctuation and minor spelling variants.",
          },
        ],
      },
      {
        id: "review",
        title: "Review settings",
        description: "Spaced repetition and items queued for review.",
        fields: [
          {
            id: "review-queue",
            label: "Review queue",
            description: "Which discoveries surface in daily review.",
          },
          {
            id: "session-length",
            label: "Session length",
            description: "Target number of items per practice session.",
          },
        ],
      },
    ],
  },
  {
    id: "library",
    label: "Library",
    description: "Defaults for collections, imports and catalogue organisation.",
    cards: [
      {
        id: "collections",
        title: "Default collections",
        description: "Where new texts land in your bibliothèque.",
        fields: [
          {
            id: "default-collection",
            label: "Default collection",
            description: "Pre-selected collection when importing content.",
          },
          {
            id: "default-level",
            label: "Default CEFR level",
            description: "Starting level assigned to newly imported texts.",
          },
        ],
      },
      {
        id: "import",
        title: "Import preferences",
        description: "Behaviour when transforming content into learning material.",
        fields: [
          {
            id: "duplicate-handling",
            label: "Duplicate handling",
            description: "Skip or replace texts with matching content hashes.",
          },
          {
            id: "enrichment-notify",
            label: "Enrichment notifications",
            description: "Notify when background analysis completes.",
          },
        ],
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    description: "Profile identity and access to your Rossiyani workspace.",
    cards: [
      {
        id: "profile",
        title: "Profile",
        description: "Your learner identity within Rossiyani.",
        fields: [
          {
            id: "display-name",
            label: "Display name",
            description: "How your name appears across the workspace.",
          },
          {
            id: "learning-language",
            label: "Interface language",
            description: "Language for explanations and UI copy.",
          },
        ],
      },
      {
        id: "security",
        title: "Security",
        description: "Sign-in, sessions and data access.",
        fields: [
          {
            id: "email",
            label: "Email address",
            description: "Primary contact for account recovery.",
          },
          {
            id: "sessions",
            label: "Active sessions",
            description: "Devices currently signed in to your account.",
          },
        ],
      },
    ],
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Visual tone and density across Reader, Explorer and Practice.",
    cards: [
      {
        id: "theme",
        title: "Theme",
        description: "Overall colour and surface treatment.",
        fields: [
          {
            id: "colour-mode",
            label: "Colour mode",
            description: "Editorial cream (default) or reduced-contrast alternatives.",
          },
        ],
      },
      {
        id: "visual",
        title: "Visual preferences",
        description: "Fine-tune density and accent usage.",
        fields: [
          {
            id: "density",
            label: "Interface density",
            description: "Comfortable or compact spacing in panels and cards.",
          },
          {
            id: "gold-accents",
            label: "Gold accents",
            description: "Emphasis level for progress and discovery highlights.",
          },
        ],
      },
    ],
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "Data portability, diagnostics and power-user options.",
    cards: [
      {
        id: "data",
        title: "Data & export",
        description: "Your learning graph and reading history.",
        fields: [
          {
            id: "export-data",
            label: "Export workspace data",
            description: "Download vocabulary, progress and saved discoveries.",
          },
          {
            id: "clear-cache",
            label: "Clear local cache",
            description: "Reset client-side preferences and cached analysis.",
          },
        ],
      },
      {
        id: "diagnostics",
        title: "Diagnostics",
        description: "Technical information for troubleshooting.",
        fields: [
          {
            id: "api-metrics",
            label: "Analysis metrics",
            description: "View knowledge coverage and import statistics.",
          },
          {
            id: "debug-mode",
            label: "Debug overlays",
            description: "Show internal identifiers in Explorer and Reader.",
          },
        ],
      },
    ],
  },
];

export const DEFAULT_SETTINGS_SECTION: SettingsSectionId = "reading";

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return SETTINGS_SECTIONS.some((section) => section.id === value);
}

export function getSettingsSection(id: SettingsSectionId): SettingsSection {
  return SETTINGS_SECTIONS.find((section) => section.id === id) ?? SETTINGS_SECTIONS[0];
}
