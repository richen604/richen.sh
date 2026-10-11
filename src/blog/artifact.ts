export interface ArtPreset {
  version: 1;
  width: number;
  height: number;
  crop: "cover" | "contain" | "fill";
  position: "centre";
  glyphs: " ·•●";
  coverage: number[];
  palette: string[] | { mode: "auto"; colors: 32; shadowLift?: number;
    shadowRecovery?: { density: number; coverage: number[] };
    adjustments?: { lightness: number; chroma: number; hue: number } };
  background: string;
  tone: { gamma: number; floor: number; gain: number };
  dithering: "bayer4";
  ditherStrength?: number;
}

export interface ArtArtifact {
  version: 1;
  width: number;
  height: number;
  rows: string[];
  colors: number[];
  palette: string[];
  background: string;
  sourceHash: string;
  converter: string;
  preset: ArtPreset;
}

const hex = /^#[0-9a-f]{6}$/i;
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const dimension = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 400;
const palette = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.length <= 64 &&
  value.every((color: unknown) => typeof color === "string" && hex.test(color));
const autoPalette = (value: unknown) => {
  if (!object(value) || value.mode !== "auto" || value.colors !== 32) return false;
  if (value.shadowLift !== undefined && (typeof value.shadowLift !== "number" || !Number.isFinite(value.shadowLift) || value.shadowLift < 0 || value.shadowLift > 0.06)) return false;
  if (value.shadowRecovery !== undefined) {
    const r = value.shadowRecovery;
    if (!object(r) || typeof r.density !== "number" || !Number.isFinite(r.density) || r.density < 0 || r.density > 2 ||
      !Array.isArray(r.coverage) || r.coverage.length !== 4 || r.coverage[0] !== 0 ||
      !r.coverage.every((v: unknown, i: number) => typeof v === "number" && Number.isFinite(v) &&
        (i === 0 || (v >= 0.05 && v <= 1 && v > (r.coverage as number[])[i - 1])))) return false;
  }
  if (value.adjustments === undefined) return true;
  const a = value.adjustments;
  return object(a) && typeof a.lightness === "number" && Number.isFinite(a.lightness) && Math.abs(a.lightness) <= 0.2 &&
    typeof a.chroma === "number" && Number.isFinite(a.chroma) && a.chroma >= 0 && a.chroma <= 2 &&
    typeof a.hue === "number" && Number.isFinite(a.hue) && Math.abs(a.hue) <= 180;
};

export function validatePreset(value: unknown): asserts value is ArtPreset {
  if (!object(value) || value.version !== 1 || !dimension(value.width) ||
      !dimension(value.height) || !["cover", "contain", "fill"].includes(String(value.crop)) ||
      value.position !== "centre" || value.glyphs !== " ·•●" || value.dithering !== "bayer4" ||
      (value.ditherStrength !== undefined && (typeof value.ditherStrength !== "number" || !Number.isFinite(value.ditherStrength) || value.ditherStrength < 0 || value.ditherStrength > 1)) ||
      !(palette(value.palette) || autoPalette(value.palette)) || typeof value.background !== "string" || !hex.test(value.background) ||
      !Array.isArray(value.coverage) || JSON.stringify(value.coverage) !== "[0,0.3,0.6,1]" ||
      !object(value.tone) || typeof value.tone.gamma !== "number" || !Number.isFinite(value.tone.gamma) ||
      value.tone.gamma <= 0 || value.tone.gamma > 4 || typeof value.tone.floor !== "number" ||
      !Number.isFinite(value.tone.floor) || value.tone.floor < 0 || value.tone.floor > 1 ||
      typeof value.tone.gain !== "number" || !Number.isFinite(value.tone.gain) || value.tone.gain <= 0 || value.tone.gain > 4) {
    throw new Error("Invalid artwork preset (expected version 1, bounded dimensions, hex palette and finite tone settings)");
  }
}

export function validateArtifact(value: unknown): asserts value is ArtArtifact {
  if (!object(value) || value.version !== 1 || !dimension(value.width) || !dimension(value.height) ||
      !palette(value.palette) || typeof value.background !== "string" || !hex.test(value.background) ||
      !Array.isArray(value.rows) || value.rows.length !== value.height ||
      !value.rows.every((row: unknown) => typeof row === "string" && Array.from(row).length === value.width && /^[ ·•●]+$/.test(row)) ||
      !Array.isArray(value.colors) || value.colors.length !== value.width * value.height ||
      !value.colors.every((index: unknown) => typeof index === "number" && Number.isInteger(index) && index >= 0 && index < (value.palette as string[]).length) ||
      typeof value.sourceHash !== "string" || !/^[a-f0-9]{64}$/.test(value.sourceHash) ||
      typeof value.converter !== "string" || !value.converter.trim()) {
    throw new Error("Invalid artwork artifact (dimensions, glyph rows, palette indices or provenance)");
  }
  validatePreset(value.preset);
  if (value.preset.width !== value.width || value.preset.height !== value.height ||
      value.preset.background !== value.background || (Array.isArray(value.preset.palette)
        ? JSON.stringify(value.preset.palette) !== JSON.stringify(value.palette)
        : value.palette.length !== value.preset.palette.colors)) {
    throw new Error("Artwork artifact does not match its preset");
  }
}
