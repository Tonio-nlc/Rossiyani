import { NextResponse } from "next/server";

import { forgotPasswordSchema, normalizeEmail } from "@/lib/auth/validation";
import { createPasswordResetToken } from "@/services/auth/password-reset";
import { findUserByEmail } from "@/services/auth/user-repository";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = forgotPasswordSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Requête invalide." },
        { status: 400 },
      );
    }

    const email = normalizeEmail(parsed.data.email);
    const user = await findUserByEmail(email);

    // Always return success to avoid email enumeration.
    if (user) {
      const token = await createPasswordResetToken(user.id);
      if (process.env.NODE_ENV !== "production") {
        console.info(`[auth] Password reset token for ${email}: ${token}`);
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        "Si un compte existe pour cette adresse, un lien de réinitialisation a été envoyé.",
    });
  } catch {
    return NextResponse.json({ error: "Impossible de traiter la demande." }, { status: 500 });
  }
}
