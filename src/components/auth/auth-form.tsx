"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthFormProps = {
  mode: "login" | "register";
  onSubmit: (input: {
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<string | null>;
};

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    const message = await onSubmit({
      email,
      password,
      displayName: mode === "register" ? displayName : undefined,
    });
    setPending(false);
    if (message) {
      setError(message);
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {mode === "register" ? (
        <label className="auth-form__field">
          <span>Prénom ou pseudo</span>
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="name"
            className="auth-form__input"
          />
        </label>
      ) : null}

      <label className="auth-form__field">
        <span>E-mail</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="auth-form__input"
        />
      </label>

      <label className="auth-form__field">
        <span>Mot de passe</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          required
          minLength={8}
          className="auth-form__input"
        />
      </label>

      {error ? <p className="auth-form__error">{error}</p> : null}

      <button type="submit" className="auth-form__submit focus-kb" disabled={pending}>
        {pending ? "Patientez…" : mode === "register" ? "Créer mon compte" : "Se connecter"}
      </button>

      <p className="auth-form__footer">
        {mode === "login" ? (
          <>
            Pas encore de compte ? <Link href="/register">Créer un compte</Link>
          </>
        ) : (
          <>
            Déjà inscrit ? <Link href="/login">Se connecter</Link>
          </>
        )}
      </p>

      {mode === "login" ? (
        <p className="auth-form__footer">
          <Link href="/forgot-password">Mot de passe oublié ?</Link>
        </p>
      ) : null}
    </form>
  );
}
