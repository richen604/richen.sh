// OKLab matrices: Björn Ottosson, https://bottosson.github.io/posts/oklab/ (2021 update).
export type Color = [number, number, number];
export const clamp = (v: number) => Math.max(0, Math.min(1, v));
export const linear = (v: number) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
const encoded = (v: number) => v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
export const fromHex = (s: string): Color => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255) as Color;
export const toHex = (rgb: Color) => "#" + rgb.map((v) => Math.round(clamp(v) * 255).toString(16).padStart(2, "0")).join("");
export function toLab(rgb: Color): Color {
  const [r, g, b] = rgb.map(linear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
export function fromLab([L, a, b]: Color): Color {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [encoded(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    encoded(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    encoded(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)];
}
export const distance = (a: Color, b: Color) => a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0);
export function shadowWeight(L: number) {
  const t = clamp((L - 0.25) / 0.4);
  return 1 - t * t * (3 - 2 * t);
}
export function shadowDensity(level: number, lab: Color, density: number) {
  // No floor: black stays blank. Highlights retain the original Bayer/gamma level.
  if (lab[0] === 0) return 0;
  return clamp(level + density * level * (1 - level) * shadowWeight(lab[0]));
}
export function shadowForeground(rgb: Color, coverage: number, base: Color = rgb): Color {
  const lab = toLab(rgb), corrected = toLab(base);
  // Linear-light inverse ink fraction scales all OKLab axes equally: same hue.
  // Gamut mapping reduces chroma only when the requested foreground cannot fit.
  const scale = Math.cbrt(1 / Math.max(coverage, 0.05));
  const weight = shadowWeight(lab[0]);
  return corrected.map((v, i) => v + (lab[i] * scale - v) * weight) as Color;
}
export function nearest(color: Color, palette: Color[]) {
  let best = 0, d = Infinity;
  palette.forEach((candidate, i) => { const next = distance(color, candidate); if (next < d) { best = i; d = next; } });
  return best;
}
export function adjust(lab: Color, settings = { lightness: 0, chroma: 1, hue: 0 }, shadowLift = 0): Color {
  // Shadow-only OKLab L lift: bounded, smooth taper; L >= .65 stays unchanged.
  const t = clamp((lab[0] - 0.25) / 0.4);
  const L = clamp(lab[0] + settings.lightness + shadowLift * (1 - t * t * (3 - 2 * t)));
  const angle = Math.atan2(lab[2], lab[1]) + settings.hue * Math.PI / 180;
  const C = Math.hypot(lab[1], lab[2]) * settings.chroma;
  const rgb = (c: number): Color => fromLab([L, c * Math.cos(angle), c * Math.sin(angle)]);
  const inGamut = (v: Color) => v.every((n) => n >= -1e-7 && n <= 1 + 1e-7);
  if (inGamut(rgb(C))) return rgb(C).map(clamp) as Color;
  // Reduce OKLCH chroma at fixed hue/lightness, rather than clipping RGB channels.
  let low = 0, high = C;
  for (let i = 0; i < 24; i++) { const mid = (low + high) / 2; if (inGamut(rgb(mid))) low = mid; else high = mid; }
  return rgb(low).map(clamp) as Color;
}
export function extractPalette(data: Buffer, settings?: Parameters<typeof adjust>[1], shadowLift = 0, foreground?: (lab: Color) => Color): string[] {
  // Fixed evenly spaced sampling; farthest-point seeds, fixed Lloyd iterations, first-index ties.
  const count = Math.min(4096, data.length / 3);
  const samples: Color[] = Array.from({ length: count }, (_, i) => {
    const offset = Math.floor(i * (data.length / 3) / count) * 3;
    return toLab([data[offset] / 255, data[offset + 1] / 255, data[offset + 2] / 255]);
  });
  let centers = [samples[0]];
  while (centers.length < 32) {
    let best = 0, farthest = -1;
    samples.forEach((sample, i) => {
      const d = distance(sample, centers[nearest(sample, centers)]);
      if (d > farthest) { best = i; farthest = d; }
    });
    centers.push(samples[best]);
  }
  for (let iteration = 0; iteration < 16; iteration++) {
    const sums: Color[] = centers.map(() => [0, 0, 0]);
    const counts = centers.map(() => 0);
    samples.forEach((sample) => { const i = nearest(sample, centers); counts[i]++; sample.forEach((v, j) => { sums[i][j] += v; }); });
    centers = sums.map((sum, i) => counts[i] ? sum.map((v) => v / counts[i]) as Color : centers[i]);
  }
  return centers.map((lab) => toHex(foreground ? foreground(lab) : adjust(lab, settings, shadowLift))).sort((a, b) => {
    const aa = toLab(fromHex(a)), bb = toLab(fromHex(b));
    return aa[0] - bb[0] || aa[1] - bb[1] || aa[2] - bb[2] || a.localeCompare(b, "en");
  });
}
export function compensate(rgb: Color, coverage: number): Color {
  // Partial glyph coverage still dims source colours. Bound correction to 25% linear light;
  // unlike sunset peak-normalization this cannot turn every dark colour into a bright accent.
  return rgb.map((v) => encoded(clamp(linear(v) * Math.min(1.25, 1 / Math.max(coverage, 0.3))))) as Color;
}
