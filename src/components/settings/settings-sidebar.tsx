"use client";

import { SETTINGS_SECTIONS } from "./settings-data";
import { SettingsSectionIcon } from "./settings-icons";
import type { SettingsSectionId } from "./settings-types";

type SettingsSidebarProps = {
  activeSection: SettingsSectionId;
  onSelect: (id: SettingsSectionId) => void;
};

export function SettingsSidebar({ activeSection, onSelect }: SettingsSidebarProps) {
  return (
    <aside className="settings-workspace__sidebar" aria-label="Settings navigation">
      <div className="settings-workspace__sidebar-head">
        <p className="settings-workspace__sidebar-title">Navigation</p>
        <p className="settings-workspace__sidebar-subtitle">Paramètres</p>
      </div>

      <nav className="settings-workspace-nav">
        {SETTINGS_SECTIONS.map((section) => {
          const active = section.id === activeSection;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              aria-current={active ? "page" : undefined}
              className={[
                "settings-workspace-nav__link focus-kb",
                active ? "settings-workspace-nav__link--active" : "",
              ].join(" ")}
            >
              <SettingsSectionIcon id={section.id} className="settings-workspace-nav__icon" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
