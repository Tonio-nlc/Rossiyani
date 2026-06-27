import { RESET_TOKEN_DURATION_MS } from "@/lib/auth/types";
import { prisma } from "@/lib/prisma";

import { createOpaqueToken, hashOpaqueToken } from "./crypto";

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = createOpaqueToken();
  const tokenHash = await hashOpaqueToken(token);

  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_DURATION_MS),
    },
  });

  return token;
}

export async function consumePasswordResetToken(
  token: string,
): Promise<{ userId: string } | null> {
  const tokenHash = await hashOpaqueToken(token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!row || row.usedAt || row.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  await prisma.passwordResetToken.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });

  return { userId: row.userId };
}
