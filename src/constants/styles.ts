import type { StrokePattern } from "../types";

export const TRANSPARENT = "transparent";
export const COLOR_PICKER = "color-picker";

export const LINE_DASH: Record<StrokePattern, number[]> = {
  Solid: [],
  Dashed: [10, 15],
  Dotted: [1, 15],
};

export const LINE_DASH_REVERSE: Record<string, StrokePattern> = {
  "": "Solid",
  "10,15": "Dashed",
  "1,15": "Dotted",
};
