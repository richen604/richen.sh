import { realpath } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";

export function validateAsset(name: string) {
  if (!/^assets\/(?:[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\/)*[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/.test(name)) throw new Error(`Invalid post asset: ${name}`);
}

export function validateArtwork(name: string) {
  validateAsset(name.replace(/^shared\//, "assets/"));
  if (!name.endsWith(".art.json")) throw new Error(`Invalid artwork: ${name}`);
}

/** Shared artwork lives only under content/assets/art; no registry or source needed. */
export async function artworkPath(root: string, directory: string, name: string) {
  validateArtwork(name);
  if (!name.startsWith("shared/")) return assetPath(directory, name);
  const base = resolve(await realpath(root), "content/assets/art");
  const file = await realpath(resolve(base, name.slice("shared/".length)));
  if (!file.startsWith(base + sep)) throw new Error(`Shared artwork escapes directory: ${name}`);
  return file;
}

/** Check existing parents too: a missing output must not escape via a symlink. */
export async function assetPath(directory: string, name: string) {
  validateAsset(name);
  const base = await realpath(directory);
  const file = resolve(base, name);
  let ancestor = file;
  while (true) {
    try {
      const actual = await realpath(ancestor);
      if (!actual.startsWith(base + sep)) throw new Error(`Post asset escapes directory: ${name}`);
      return file;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      ancestor = dirname(ancestor);
      if (ancestor === base) return file;
    }
  }
}
