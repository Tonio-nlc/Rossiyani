"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/components/auth/auth-provider";

export function AuthRegisterClient() {
  const { register } = useAuth();
  return <AuthForm mode="register" onSubmit={register} />;
}
