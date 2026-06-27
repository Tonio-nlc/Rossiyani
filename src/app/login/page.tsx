import Link from "next/link";

import { AuthLoginClient } from "@/components/auth/auth-login-client";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <Link href="/" className="auth-page__back focus-kb">
          ← Rossiyani
        </Link>
        <h1 className="auth-page__title">Connexion</h1>
        <p className="auth-page__lead">
          Retrouvez votre progression, votre vocabulaire et vos préférences sur tous vos appareils.
        </p>
        <AuthLoginClient />
      </div>
    </div>
  );
}
