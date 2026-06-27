"use client";

import type { AuthUser } from "@/lib/auth/types";

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me");
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as { user?: AuthUser | null };
  return data.user ?? null;
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser } | { error: string }> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as { user?: AuthUser; error?: string };
  if (!response.ok) {
    return { error: data.error ?? "Connexion impossible." };
  }
  if (!data.user) {
    return { error: "Réponse serveur invalide." };
  }
  return { user: data.user };
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<{ user: AuthUser } | { error: string }> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as { user?: AuthUser; error?: string };
  if (!response.ok) {
    return { error: data.error ?? "Inscription impossible." };
  }
  if (!data.user) {
    return { error: "Réponse serveur invalide." };
  }
  return { user: data.user };
}

export async function logoutUser(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function requestPasswordReset(email: string): Promise<{ ok: boolean; message: string }> {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = (await response.json()) as { message?: string; error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "Demande impossible.");
  }
  return { ok: true, message: data.message ?? "Demande envoyée." };
}

export async function resetPassword(input: {
  token: string;
  password: string;
}): Promise<{ ok: boolean } | { error: string }> {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await response.json()) as { error?: string };
  if (!response.ok) {
    return { error: data.error ?? "Réinitialisation impossible." };
  }
  return { ok: true };
}
