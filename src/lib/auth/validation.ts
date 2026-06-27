import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Adresse e-mail invalide.").max(255),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(128),
  displayName: z.string().trim().max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse e-mail invalide."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Jeton invalide."),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
    .max(128),
});

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
