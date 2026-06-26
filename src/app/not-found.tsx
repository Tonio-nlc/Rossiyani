import { ErrorPage } from "@/components/design-system/error-page";

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      title="Page introuvable"
      description="Cette adresse ne correspond à aucun contenu dans Rossiyani. Le lien est peut-être obsolète ou le texte a été déplacé."
      primaryAction={{ label: "Retour à l'accueil", href: "/" }}
      secondaryAction={{ label: "Ouvrir la bibliothèque", href: "/library" }}
    />
  );
}
