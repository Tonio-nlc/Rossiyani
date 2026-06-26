"use client";

import { ErrorPage } from "@/components/design-system/error-page";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ reset }: ErrorProps) {
  return (
    <ErrorPage
      code="Erreur"
      title="Un problème est survenu"
      description="Rossiyani n'a pas pu charger cette page. Votre progression est en sécurité — réessayez dans un instant."
      primaryAction={{ label: "Retour à l'accueil", href: "/" }}
      onRetry={reset}
    />
  );
}
