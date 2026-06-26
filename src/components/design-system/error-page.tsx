import { GhostButton } from "./ghost-button";
import { PrimaryButton } from "./primary-button";

type ErrorPageProps = {
  code: string;
  title: string;
  description: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  onRetry?: () => void;
};

export function ErrorPage({
  code,
  title,
  description,
  primaryAction = { label: "Retour à l'accueil", href: "/" },
  secondaryAction,
  onRetry,
}: ErrorPageProps) {
  return (
    <div className="v2-error-page animate-fade-up">
      <div className="v2-error-page__card">
        <p className="v2-error-page__code">{code}</p>
        <h1 className="v2-error-page__title">{title}</h1>
        <p className="v2-error-page__lead">{description}</p>
        <div className="v2-error-page__actions">
          <PrimaryButton href={primaryAction.href}>{primaryAction.label}</PrimaryButton>
          {onRetry ? (
            <GhostButton onClick={onRetry}>Réessayer</GhostButton>
          ) : secondaryAction ? (
            <GhostButton href={secondaryAction.href}>{secondaryAction.label}</GhostButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
