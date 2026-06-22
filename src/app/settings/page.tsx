import type { Metadata } from "next";

import { SettingsWorkspace } from "@/components/settings";

export const metadata: Metadata = {
  title: "Settings · Rossiyani",
  description: "Configure your reading, exploration and practice environment.",
};

export default function SettingsPage() {
  return <SettingsWorkspace />;
}
