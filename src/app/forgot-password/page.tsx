"use client";

import Link from "next/link";
import { useState } from "react";

import { requestPasswordReset } from "@/lib/auth/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demande impossible.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <Link href="/login" className="auth-page__back focus-kb">
          ← Connexion
        </Link>
        <h1 className="auth-page__title">Mot de passe oublié</h1>
        <p className="auth-page__lead">
          Nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-form__field">
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="auth-form__input"
            />
          </label>
          {error ? <p className="auth-form__error">{error}</p> : null}
          {message ? <p className="auth-form__success">{message}</p> : null}
          <button type="submit" className="auth-form__submit focus-kb" disabled={pending}>
            {pending ? "Envoi…" : "Envoyer le lien"}
          </button>
        </form>
      </div>
    </div>
  );
}
