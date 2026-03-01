import type { RectPointsTuple } from "../types";
import { CanvasService } from "../services";

/**
 * Recreates a 2D context on an overlay canvas with DPI scaling.
 */
export const recreateEditContext = (
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D => {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio ?? 1;

  canvas.style.width = String(width);
  canvas.style.height = String(height);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  CanvasService.applyViewportTransform(ctx);

  return ctx;
};

/**
 * Draws the selection bounding box with corner handles.
 */
export const drawSelectionBox = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  w: number,
  h: number
): void => {
  ctx.strokeStyle = "#0000ff";
  ctx.lineWidth = 1;
  ctx.lineJoin = "miter";
  ctx.miterLimit = 10;

  const negW = w < 0;
  const negH = h < 0;

  // Dashed bounding rectangle
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(
    x1 - (negW ? -5 : 5),
    y1 - (negH ? -5 : 5),
    w + (negW ? -10 : 10),
    h + (negH ? -10 : 10)
  );

  // Corner handles
  ctx.fillStyle = "#ffffff";
  ctx.setLineDash([]);

  const corners: RectPointsTuple[] = [
    [x1 - (negW ? -2 : 8), y1 - (negH ? -2 : 8), 6, 6],
    [x2 + (negW ? -8 : 2), y1 - (negH ? -2 : 8), 6, 6],
    [x2 + (negW ? -8 : 2), y2 + (negH ? -8 : 2), 6, 6],
    [x1 - (negW ? -2 : 8), y2 + (negH ? -8 : 2), 6, 6],
  ];

  for (const corner of corners) {
    ctx.fillRect(...corner);
    ctx.strokeRect(...corner);
  }
};
