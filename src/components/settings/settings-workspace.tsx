"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_SETTINGS_SECTION,
  getSettingsSection,
  isSettingsSectionId,
} from "./settings-data";
import { SettingsSectionPanel } from "./settings-section-panel";
import { SettingsSidebar } from "./settings-sidebar";
import type { SettingsSectionId } from "./settings-types";

function readSectionFromHash(): SettingsSectionId {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS_SECTION;
  }
  const hash = window.location.hash.replace("#", "");
  return isSettingsSectionId(hash) ? hash : DEFAULT_SETTINGS_SECTION;
}

export function SettingsWorkspace() {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(DEFAULT_SETTINGS_SECTION);

  useEffect(() => {
    setActiveSection(readSectionFromHash());

    const onHashChange = () => {
      setActiveSection(readSectionFromHash());
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const selectSection = useCallback((id: SettingsSectionId) => {
    setActiveSection(id);
    const nextHash = `#${id}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }
  }, []);

  const section = getSettingsSection(activeSection);

  return (
    <div className="settings-workspace">
      <SettingsSidebar activeSection={activeSection} onSelect={selectSection} />

      <div className="settings-workspace__main">
        <header className="settings-workspace__hero">
          <p className="settings-workspace__eyebrow">Settings</p>
          <h1 className="settings-workspace__title">Workspace &amp; Preferences</h1>
          <p className="settings-workspace__lead">
            Configure your reading, exploration and practice environment.
          </p>
          <div className="settings-workspace__rule" aria-hidden />
        </header>

        <SettingsSectionPanel section={section} />
      </div>
    </div>
  );
}
