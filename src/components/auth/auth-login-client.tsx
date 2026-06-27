"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/components/auth/auth-provider";

export function AuthLoginClient() {
  const { login } = useAuth();
  return <AuthForm mode="login" onSubmit={login} />;
}
