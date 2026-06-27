import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = path.join(process.cwd(), "public", "media", "audio", "cache");

export async function ensureAudioCacheDir(): Promise<string> {
  await mkdir(CACHE_DIR, { recursive: true });
  return CACHE_DIR;
}

export async function writeAudioCacheFile(
  contentHash: string,
  buffer: Buffer,
  extension = "mp3",
): Promise<string> {
  await ensureAudioCacheDir();
  const filename = `${contentHash}.${extension}`;
  const absolutePath = path.join(CACHE_DIR, filename);
  await writeFile(absolutePath, buffer);
  return `/media/audio/cache/${filename}`;
}

export async function findStaticAudioFile(
  scope: "sentence" | "word" | "utterance",
  entityId: string,
): Promise<string | null> {
  const relativePath = `/media/audio/${scope}s/${entityId}.mp3`;
  const absolutePath = path.join(process.cwd(), "public", relativePath.slice(1));
  try {
    await access(absolutePath);
    return relativePath;
  } catch {
    return null;
  }
}
