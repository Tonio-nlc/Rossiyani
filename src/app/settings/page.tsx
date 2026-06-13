import { Chapter, EditorialTitle, Section } from "@/components/editorial";

export default function SettingsPage() {
  return (
    <Chapter>
      <EditorialTitle variant="page">Settings</EditorialTitle>
      <p className="editorial-intro mt-4">
        Préférences de lecture et de l&apos;espace de travail.
      </p>

      <Section eyebrow="Lecture" title="Affichage" className="mt-[var(--space-5)]">
        <p className="text-metadata text-[var(--ink-secondary)]">
          Les préférences détaillées seront regroupées ici lors de la refonte du Reader.
        </p>
      </Section>
    </Chapter>
  );
}
