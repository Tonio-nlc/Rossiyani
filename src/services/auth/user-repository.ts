import { prisma } from "@/lib/prisma";

import { hashPassword } from "./crypto";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(input: {
  email: string;
  password: string;
  displayName?: string | null;
}) {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      displayName: input.displayName?.trim() || null,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      createdAt: true,
    },
  });
}

export async function updateUserPassword(userId: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function updateUserDisplayName(userId: string, displayName: string | null): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { displayName: displayName?.trim() || null },
  });
}
