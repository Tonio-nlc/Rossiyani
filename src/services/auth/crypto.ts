import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SCRYPT_KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [algorithm, salt, hash] = passwordHash.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) {
    return false;
  }
  return timingSafeEqual(expected, derived);
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function hashOpaqueToken(token: string): Promise<string> {
  const derived = (await scryptAsync(token, "rossiyani-auth", SCRYPT_KEYLEN)) as Buffer;
  return derived.toString("hex");
}
