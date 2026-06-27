import { NextResponse } from "next/server";

import { resetPasswordSchema } from "@/lib/auth/validation";
import { consumePasswordResetToken } from "@/services/auth/password-reset";
import { updateUserPassword } from "@/services/auth/user-repository";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = resetPasswordSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Réinitialisation invalide." },
        { status: 400 },
      );
    }

    const consumed = await consumePasswordResetToken(parsed.data.token);
    if (!consumed) {
      return NextResponse.json(
        { error: "Lien de réinitialisation invalide ou expiré." },
        { status: 400 },
      );
    }

    await updateUserPassword(consumed.userId, parsed.data.password);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Impossible de réinitialiser le mot de passe." }, { status: 500 });
  }
}
