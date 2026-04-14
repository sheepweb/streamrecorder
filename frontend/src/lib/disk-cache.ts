import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";

const CACHE_DIR = process.env.DISK_CACHE_DIR || "/tmp/s3-cache";

if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

function getCachePath(key: string): string {
  const hash = createHash("md5").update(key).digest("hex");
  const subdir = join(CACHE_DIR, hash.substring(0, 2));
  if (!existsSync(subdir)) {
    mkdirSync(subdir, { recursive: true });
  }
  return join(subdir, hash);
}

export function getDiskCache(key: string): Buffer | null {
  const path = getCachePath(key);
  if (existsSync(path)) {
    return readFileSync(path);
  }
  return null;
}

export async function setDiskCache(
  key: string,
  stream: ReadableStream,
): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const buffer = Buffer.concat(chunks);
  const path = getCachePath(key);
  writeFileSync(path, buffer);
  return buffer;
}
