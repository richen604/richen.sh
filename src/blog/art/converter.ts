import { createHash } from "node:crypto";
import { watch } from "node:fs";
import { readFile, writeFile, rename, realpath, rm, mkdtemp } from "node:fs/promises";
import { resolve, dirname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { threshold } from "./dither.ts";
import { validateArtifact, validatePreset, type ArtArtifact } from "../artifact.ts";
import { extractPalette, fromHex, toHex, toLab, nearest, adjust, compensate, shadowDensity, shadowForeground, type Color } from "./color.ts";

export const CONVERTER = "terminal-halftone-v1/ascii-771ff384/sharp-0.35.5";
// Adapted from ascii.rest ocean-sunset, revision 771ff384fa0f9c8f517d400de8456d1ae1272ee9.
// Copyright (c) 2026 bas3line. MIT notice: docs/licenses/ascii-rest-MIT.txt.
const BAYER = Array.from({ length: 16 }, (_, i) => threshold("bayer4", i % 4, Math.floor(i / 4)));
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, v: number) => {
  const k = clamp((v - a) / (b - a));
  return k * k * (3 - 2 * k);
};

export async function convert(source: Buffer, settings: unknown): Promise<ArtArtifact> {
  validatePreset(settings);
  const preset = settings;
  const ditherStrength = preset.ditherStrength ?? 1;
  const data = await sharp(source, { limitInputPixels: 40_000_000 })
    .rotate().resize(preset.width, preset.height, {
      fit: preset.crop, position: preset.position, background: preset.background,
      kernel: "lanczos3", fastShrinkOnLoad: false,
    }).flatten({ background: preset.background }).toColourspace("srgb").removeAlpha().raw().toBuffer();
  const auto = !Array.isArray(preset.palette) ? preset.palette : undefined;
  const recovery = auto?.shadowRecovery;
  const tone = (rgb: Color) => clamp(preset.tone.floor + (1 - preset.tone.floor) * Math.pow(Math.max(...rgb, 1e-4), preset.tone.gamma) * preset.tone.gain);
  const recover = (rgb: Color, coverage: number) => {
    const corrected = shadowForeground(rgb, coverage);
    const lifted = toLab(adjust(toLab(rgb), undefined, auto?.shadowLift));
    return adjust(lifted[0] > corrected[0] ? lifted : corrected, auto?.adjustments);
  };
  const baseline = Array.isArray(preset.palette) ? preset.palette : extractPalette(data, auto?.adjustments, auto?.shadowLift);
  const baselineLabs = baseline.map((color) => toLab(fromHex(color)));
  const protectedColors = new Set<string>();
  const foregrounds = new Map<string, string>();
  if (recovery) {
    // Reserve every existing colour used by a highlight. Otherwise brightened
    // shadow centroids can steal its nearest match in the finite 32-colour palette.
    for (let i = 0; i < data.length / 3; i++) {
      const rgb: Color = [data[i * 3] / 255, data[i * 3 + 1] / 255, data[i * 3 + 2] / 255];
      if (toLab(rgb)[0] < 0.65) continue;
      const x = i % preset.width, y = Math.floor(i / preset.width);
      const step = Math.max(0, Math.min(3, Math.round(tone(rgb) * 3 + BAYER[(y & 3) * 4 + (x & 3)])));
      const target = adjust(toLab(compensate(rgb, preset.coverage[step])), auto?.adjustments);
      protectedColors.add(baseline[nearest(toLab(target), baselineLabs)]);
    }
  }
  const resolved = !recovery ? baseline : extractPalette(data, auto?.adjustments, auto?.shadowLift,
    (lab) => {
      const original = toHex(adjust(lab, auto?.adjustments, auto?.shadowLift));
      const saved = foregrounds.get(original);
      if (saved) return fromHex(saved);
      if (protectedColors.has(original)) { foregrounds.set(original, original); return fromHex(original); }
      const rgb = adjust(lab);
      const level = shadowDensity(tone(rgb), lab, recovery.density) * 3;
      const low = Math.floor(level), high = Math.min(3, low + 1);
      // Same expected glyph mixture used by the fixed Bayer quantizer, so palette
      // centroids represent foreground ink, not an uncorrected dark source.
      const coverage = recovery.coverage[low] + (recovery.coverage[high] - recovery.coverage[low]) * (level - low);
      const foreground = toHex(recover(rgb, coverage));
      foregrounds.set(original, foreground);
      return fromHex(foreground);
    });
  const palette = resolved.map(fromHex);
  const labs = palette.map(toLab);
  const recoveredIndices = baseline.map((color) => resolved.indexOf(foregrounds.get(color) ?? color));
  const rows: string[] = [];
  const colors: number[] = [];
  for (let y = 0; y < preset.height; y++) {
    let row = "";
    for (let x = 0; x < preset.width; x++) {
      const offset = (y * preset.width + x) * 3;
      const rgb = [data[offset], data[offset + 1], data[offset + 2]].map((v) => v / 255) as Color;
      const peak = Math.max(...rgb, 1e-4);
      const originalLevel = tone(rgb);
      const level = recovery ? shadowDensity(originalLevel, toLab(rgb), recovery.density) : originalLevel;
      const step = Math.max(0, Math.min(3, Math.round(level * 3 + threshold(preset.dithering, x, y) * ditherStrength)));
      const colorStep = Math.max(0, Math.min(3, Math.round(level * 3 + BAYER[(y & 3) * 4 + (x & 3)] * ditherStrength)));
      row += preset.glyphs[step];
      if (auto) {
        if (recovery) {
          // Preserve the original OKLab source-to-centroid correspondence. Matching
           // against brighter foreground entries instead can borrow a different hue.
           // Keep full-strength baseline coverage here and in highlight reservation:
           // changing glyph noise must not change palette entries or source matches.
          const originalStep = Math.max(0, Math.min(3, Math.round(originalLevel * 3 + BAYER[(y & 3) * 4 + (x & 3)])));
          const corrected = toLab(compensate(rgb, preset.coverage[originalStep]));
          const lifted = auto.shadowLift ? toLab(adjust(toLab(rgb), undefined, auto.shadowLift)) : corrected;
          const target = adjust(lifted[0] > corrected[0] ? lifted : corrected, auto.adjustments);
          colors.push(recoveredIndices[nearest(toLab(target), baselineLabs)]);
          continue;
        }
        // Keep coverage correction in highlights. Shadow lift is an alternative
        // minimum L, not an additional boost on already compensated colours.
        const corrected = toLab(compensate(rgb, preset.coverage[colorStep]));
        const lifted = auto.shadowLift ? toLab(adjust(toLab(rgb), undefined, auto.shadowLift)) : corrected;
        const target = adjust(lifted[0] > corrected[0] ? lifted : corrected, auto.adjustments);
        colors.push(nearest(toLab(target), labs));
        continue;
      }
      const want = colorStep ? Math.min(1, (level + 0.06) / preset.coverage[colorStep]) : 0;
      const scale = ((0.3 + 0.7 * want) * (0.4 + 0.6 * smooth(0.14, 0.5, level))) / peak;
      const [r, g, b] = rgb.map((v) => clamp(v * scale));
      let best = 0, distance = Infinity;
      for (let i = 0; i < palette.length; i++) {
        const [pr, pg, pb] = palette[i];
        const d = 0.3 * (pr - r) ** 2 + 0.5 * (pg - g) ** 2 + 0.2 * (pb - b) ** 2;
        if (d < distance) { best = i; distance = d; }
      }
      colors.push(best);
    }
    rows.push(row);
  }
  const artifact: ArtArtifact = {
    version: 1, width: preset.width, height: preset.height, rows, colors,
    palette: resolved, background: preset.background,
    sourceHash: createHash("sha256").update(source).digest("hex"), converter: auto ? `${CONVERTER}/oklab-auto-v1${auto.shadowLift ? "/shadow-lift-v2" : ""}${recovery ? "/shadow-coverage-v1" : ""}` : CONVERTER, preset,
  };
  validateArtifact(artifact);
  return artifact;
}

export const serialize = (artifact: ArtArtifact) => `${JSON.stringify(artifact)}\n`;

export async function writeAtomic(output: string, text: string) {
  const temporaryDirectory = await mkdtemp(join(dirname(output), ".terminal-art-"));
  try {
    const temporary = join(temporaryDirectory, "artifact.json");
    await writeFile(temporary, text, { flag: "wx" });
    await rename(temporary, output);
  } finally { await rm(temporaryDirectory, { recursive: true, force: true }); }
}

export async function runCLI() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log("Usage: terminal-art <source-image> [<preset.json>] <output.art.json> [--watch | --check]\n       pnpm art <source-image> [<preset.json>] <output.art.json> [--watch | --check]\nOffline, deterministic coloured glyph converter. Omitted preset uses src/blog/art/default-preset.json. --check compares against source without writing; --watch regenerates atomically. Publishing only reads saved artifacts.");
    return;
  }
  const positional = args.filter((arg) => !arg.startsWith("--"));
  if (![2, 3].includes(positional.length) || args.some((arg) => arg.startsWith("--") && !["--watch", "--check"].includes(arg)) ||
      (args.includes("--watch") && args.includes("--check"))) throw new Error("Expected source, optional preset, output; see pnpm art --help");
  const [source, preset, output] = (positional.length === 2
    ? [positional[0], fileURLToPath(new URL("./default-preset.json", import.meta.url)), positional[1]]
    : positional).map((file) => resolve(file));
  if (source === output || preset === output) throw new Error("Output must not overwrite source or preset");
  const [sourcePath, presetPath, outputPath] = await Promise.all([
    realpath(source), realpath(preset), realpath(output).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
      return output;
    }),
  ]);
  if (sourcePath === outputPath || presetPath === outputPath) throw new Error("Output must not overwrite source or preset");
  const generate = async () => {
    const text = serialize(await convert(await readFile(source), JSON.parse(await readFile(preset, "utf8")) as unknown));
    if (args.includes("--check")) {
      if (text !== await readFile(output, "utf8")) throw new Error(`Artwork is stale: ${output}`);
      console.log(`Artwork matches: ${output}`);
    } else {
      await writeAtomic(output, text);
      console.log(`Generated ${output}`);
    }
  };
  await generate();
  if (args.includes("--watch")) {
    let queue = Promise.resolve();
    for (const file of [source, preset]) {
      // Watch directories: editors commonly replace rather than modify files.
      const directory = dirname(file);
      watch(directory, (_event, name) => {
        if (String(name) === basename(file)) {
          queue = queue.then(generate).catch((error: unknown) => console.error(error));
        }
      });
    }
    console.log("Watching source and preset; Ctrl-C to stop.");
  }
}
