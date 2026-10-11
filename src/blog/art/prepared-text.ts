import { createHash } from "node:crypto";
import { readFile, mkdir, lstat, realpath, readdir, unlink } from "node:fs/promises";
import { join, resolve, basename, dirname } from "node:path";
import { validateArtifact } from "../artifact.ts";
import { writeAtomic } from "./converter.ts";

/** Display-only payload. This module is build-only; browser imports its type only. */
export interface PreparedText {
  width: number;
  height: number;
  background: string;
  className: string;
  css: string;
  html: string;
}

const digest = (text: string) => createHash("sha256").update(text).digest("hex");
const generatedName = /^text-[a-f0-9]{64}\.json$/;
const cacheBudget = 64 * 1024 * 1024;
const cacheMaxAge = 7 * 24 * 60 * 60 * 1000;

async function cacheExists(directory: string) {
  const stat = await lstat(directory).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return undefined;
    throw error;
  });
  if (!stat) {
    // Check existing ancestors before mkdir can follow a parent symlink.
    await cacheExists(dirname(resolve(directory)));
    return false;
  }
  if (!stat.isDirectory() || await realpath(directory) !== resolve(directory)) {
    throw new Error(`Artwork cache must be a real directory, not a symlink: ${directory}`);
  }
  return true;
}

/** Only renderer-owned files; active entries survive even when larger than budget. */
export async function pruneTextCache(directory: string, activeFiles: ReadonlySet<string>) {
  if (!await cacheExists(directory)) return;
  const entries = [];
  for (const name of await readdir(directory)) {
    if (!generatedName.test(name)) continue;
    const stat = await lstat(join(directory, name)).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return undefined;
      throw error;
    });
    if (stat?.isFile()) entries.push({ name, size: stat.size, modified: stat.mtimeMs });
  }
  entries.sort((a, b) => a.modified - b.modified || a.name.localeCompare(b.name));
  let bytes = entries.reduce((sum, entry) => sum + entry.size, 0);
  const oldest = Date.now() - cacheMaxAge;
  for (const entry of entries) {
    if (activeFiles.has(entry.name) || (bytes <= cacheBudget && entry.modified >= oldest)) continue;
    await unlink(join(directory, entry.name)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
    bytes -= entry.size;
  }
}

export async function prepareText(raw: string, cacheDirectory?: string, activeFiles?: Set<string>): Promise<PreparedText> {
  // Source errors must never be hidden by a derived cache hit.
  const artifact: unknown = JSON.parse(raw);
  validateArtifact(artifact);
  const implementation = await Promise.all(["./prepared-text.ts", "../artifact.ts", "../AsciiArt.tsx", "../blog.css"].map(file => readFile(new URL(file, import.meta.url))));
  const hash = createHash("sha256").update(raw).update(Buffer.concat(implementation)).digest("hex");
  const file = cacheDirectory && join(cacheDirectory, `text-${hash}.json`);
  const artifactHash = digest(raw);
  const className = `art-${hash.slice(0, 16)}`;
  const css = artifact.palette.map((color, i) => `.${className} .c${i}{color:${color}}`).join("");
  if (file) activeFiles?.add(basename(file));
  if (file && cacheDirectory && await cacheExists(cacheDirectory)) {
    const stat = await lstat(file).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return undefined;
      throw error;
    });
    const cached = stat?.isFile() ? await readFile(file, "utf8").catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return undefined;
      throw error;
    }) : undefined;
    if (cached) {
      let envelope: unknown;
      try { envelope = JSON.parse(cached); }
      catch (error) { if (!(error instanceof SyntaxError)) throw error; }
      if (typeof envelope === "object" && envelope !== null) {
        const { version, artifactHash: source, payloadHash, prepared } = envelope as Record<string, unknown>;
        if (version === 1 && source === artifactHash && typeof prepared === "object" && prepared !== null) {
          const payload = prepared as Record<string, unknown>;
          if (payload.width === artifact.width && payload.height === artifact.height &&
              payload.background === artifact.background && payload.className === className &&
              payload.css === css && typeof payload.html === "string" && payload.html.length > 0 &&
              payloadHash === digest(JSON.stringify(prepared))) return prepared as PreparedText;
        }
      }
    }
  }
  const runs: { color: number; text: string }[] = [];
  artifact.rows.forEach((row, y) => {
    Array.from(row).forEach((glyph, x) => {
      const color = artifact.colors[y * artifact.width + x];
      const last = runs.at(-1);
      if (last?.color === color) last.text += glyph;
      else runs.push({ color, text: glyph });
    });
    if (y < artifact.height - 1) runs[runs.length - 1].text += "\n";
  });
  // Validation restricts glyphs to space/·/•/● and colours to hex. No HTML/CSS syntax.
  const result = {
    width: artifact.width, height: artifact.height, background: artifact.background, className,
    css,
    html: runs.map(({ color, text }) => `<span class="c${color}">${text}</span>`).join(""),
  };
  if (file && cacheDirectory) {
    await mkdir(cacheDirectory, { recursive: true });
    await cacheExists(cacheDirectory);
    await writeAtomic(file, JSON.stringify({ version: 1, artifactHash, payloadHash: digest(JSON.stringify(result)), prepared: result }));
  }
  return result;
}
