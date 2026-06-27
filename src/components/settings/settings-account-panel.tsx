"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { pushUserSyncState } from "@/lib/sync/sync-client";

export function SettingsAccountPanel() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <p className="settings-account__muted">Chargement du compte…</p>;
  }

  if (!user) {
    return (
      <div className="settings-account">
        <p className="settings-account__lead">
          Connectez-vous pour synchroniser votre progression, votre vocabulaire et vos préférences.
        </p>
        <div className="settings-account__actions">
          <Link href="/login" className="settings-account__btn settings-account__btn--primary focus-kb">
            Se connecter
          </Link>
          <Link href="/register" className="settings-account__btn focus-kb">
            Créer un compte
          </Link>
        </div>
        <p className="settings-account__note">
          Vous pouvez lire sans compte. La synchronisation est optionnelle mais recommandée.
        </p>
      </div>
    );
  }

  return (
    <div className="settings-account">
      <dl className="settings-account__facts">
        <div>
          <dt>E-mail</dt>
          <dd>{user.email}</dd>
        </div>
        {user.displayName ? (
          <div>
            <dt>Nom affiché</dt>
            <dd>{user.displayName}</dd>
          </div>
        ) : null}
      </dl>
      <div className="settings-account__actions">
        <button
          type="button"
          className="settings-account__btn focus-kb"
          onClick={() => {
            void pushUserSyncState({ mergeLocal: true });
          }}
        >
          Synchroniser maintenant
        </button>
        <button
          type="button"
          className="settings-account__btn settings-account__btn--danger focus-kb"
          onClick={() => {
            void logout();
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
