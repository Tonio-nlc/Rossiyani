import { EditorialSectionHead } from "@/components/editorial/editorial-section-head";

import type { SettingsSection } from "./settings-types";
import { SettingsSectionIcon } from "./settings-icons";

type SettingsSectionPanelProps = {
  section: SettingsSection;
};

export function SettingsSectionPanel({ section }: SettingsSectionPanelProps) {
  return (
    <div className="settings-section-panel">
      <EditorialSectionHead
        id={`settings-section-${section.id}`}
        icon={<SettingsSectionIcon id={section.id} className="editorial-section-head__icon" />}
        title={section.label}
        lead={section.description}
      />

      <ul className="settings-card-grid">
        {section.cards.map((card) => (
          <li key={card.id}>
            <article className="settings-card" aria-labelledby={`settings-card-${card.id}`}>
              <h3 id={`settings-card-${card.id}`} className="settings-card__title">
                {card.title}
              </h3>
              <p className="settings-card__description">{card.description}</p>

              <ul className="settings-field-list">
                {card.fields.map((field) => (
                  <li key={field.id} className="settings-field">
                    <div className="settings-field__body">
                      <p className="settings-field__label">{field.label}</p>
                      <p className="settings-field__description">{field.description}</p>
                    </div>
                    <span className="settings-field__status">Coming soon</span>
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
