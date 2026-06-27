"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

import { resetPassword } from "@/lib/auth/auth-client";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError("Lien de réinitialisation invalide.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await resetPassword({ token, password });
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push("/login");
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <Link href="/login" className="auth-page__back focus-kb">
          ← Connexion
        </Link>
        <h1 className="auth-page__title">Nouveau mot de passe</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-form__field">
            <span>Nouveau mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              className="auth-form__input"
            />
          </label>
          {error ? <p className="auth-form__error">{error}</p> : null}
          <button type="submit" className="auth-form__submit focus-kb" disabled={pending || !token}>
            {pending ? "Enregistrement…" : "Réinitialiser"}
          </button>
        </form>
      </div>
    </div>
  );
}
