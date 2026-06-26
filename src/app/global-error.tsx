"use client";

import { ErrorPage } from "@/components/design-system/error-page";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="fr">
      <body>
        <ErrorPage
          code="500"
          title="Service momentanément indisponible"
          description="Une erreur inattendue s'est produite. Rechargez la page ou revenez plus tard."
          primaryAction={{ label: "Retour à l'accueil", href: "/" }}
          onRetry={reset}
        />
      </body>
    </html>
  );
}
