import type { ArtPreset } from "../artifact.ts";

// Bayer recursion B(2n) = [[4B,4B+2],[4B+3,4B+1]].
export const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function threshold(_pattern: ArtPreset["dithering"], x: number, y: number) {
  return BAYER4[(y % 4) * 4 + x % 4] / 16 - 0.47;
}
