import Link from "next/link";

import { AuthRegisterClient } from "@/components/auth/auth-register-client";

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <Link href="/" className="auth-page__back focus-kb">
          ← Rossiyani
        </Link>
        <h1 className="auth-page__title">Créer un compte</h1>
        <p className="auth-page__lead">
          Sauvegardez votre progression et continuez votre lecture sur n&apos;importe quel appareil.
        </p>
        <AuthRegisterClient />
      </div>
    </div>
  );
}
