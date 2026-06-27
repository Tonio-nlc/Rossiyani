import { NextResponse } from "next/server";

import { normalizeEmail, loginSchema } from "@/lib/auth/validation";
import { verifyPassword } from "@/services/auth/crypto";
import { createSession, sessionCookieOptions } from "@/services/auth/session";
import { findUserByEmail } from "@/services/auth/user-repository";
import { ensureUserDataRow } from "@/services/sync/user-sync-repository";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Connexion invalide." },
        { status: 400 },
      );
    }

    const email = normalizeEmail(parsed.data.email);
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou mot de passe incorrect." },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "E-mail ou mot de passe incorrect." },
        { status: 401 },
      );
    }

    await ensureUserDataRow(user.id);

    const token = await createSession(user.id);
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt.toISOString(),
      },
    });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch {
    return NextResponse.json({ error: "Impossible de se connecter." }, { status: 500 });
  }
}
