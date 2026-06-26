"use client";

import { Card } from "@/components/design-system";

import { SettingsProfileHero } from "./settings-profile-hero";
import type { SettingsSection } from "./settings-types";

type SettingsSectionPanelProps = {
  section: SettingsSection;
};

export function SettingsSectionPanel({ section }: SettingsSectionPanelProps) {
  return (
    <div className="settings-section-panel">
      {section.id === "account" ? <SettingsProfileHero /> : null}

      <header className="settings-section-panel__head">
        <h2 className="r3-title settings-section-panel__title">{section.label}</h2>
        <p className="r3-lead settings-section-panel__lead">{section.description}</p>
      </header>

      <ul className="settings-card-grid">
        {section.cards.map((card) => (
          <li key={card.id}>
            <Card as="article" className="settings-card" aria-labelledby={`settings-card-${card.id}`}>
              <h3 id={`settings-card-${card.id}`} className="r3-title settings-card__title">
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
                    <span className="settings-field__status">Bientôt</span>
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
