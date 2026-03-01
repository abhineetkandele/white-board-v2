import { getBoardBoundingBox } from "../utils/geometry";
/**
 * Renders all board elements to an offscreen canvas sized to fit all content, returns the canvas.
 * Ignores viewport transform; always renders in world coordinates.
 */
export async function exportBoardToImage(/*type: "png" | "webp" = "png"*/): Promise<HTMLCanvasElement> {
  const elements = StorageService.getElements();
  const bbox = getBoardBoundingBox(elements);
  // Add some padding
  const pad = 32;
  const width = Math.ceil(bbox.width + pad * 2) || 512;
  const height = Math.ceil(bbox.height + pad * 2) || 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  // Temporarily override CanvasService viewport for export
  CanvasService.applyViewportTransform(ctx); // reset to identity
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // Shift world so (minX, minY) is at (pad, pad)
  ctx.translate(-bbox.x1 + pad, -bbox.y1 + pad);

  for (const el of elements) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = el.fillStyle as string;
    ctx.strokeStyle = el.strokeStyle as string;
    ctx.lineWidth = el.lineWidth;
    ctx.globalAlpha = el.globalAlpha;
    ctx.setLineDash(el.dash);
    ctx.beginPath();
    switch (el.type) {
      case ADD_IMAGE:
        // Note: async image loading is not supported in export
        break;
      case ADD_TEXT:
        drawText(
          ctx,
          el.x1,
          el.y1 + el.lineWidth * 4.75,
          el.text,
          null,
          el.lineWidth,
          el.strokeStyle as string
        );
        break;
      case PENCIL:
        if (!el.path.length) break;
        ctx.moveTo(el.path[0][0], el.path[0][1]);
        el.path.forEach(([px, py]) => ctx.lineTo(px, py));
        ctx.stroke();
        break;
      case LINE:
        if (!el.path.length) break;
        ctx.moveTo(el.path[0][0], el.path[0][1]);
        el.path.forEach(([px, py]) => ctx.lineTo(px, py));
        if (
          Math.abs(el.path[0][0] - el.path[el.path.length - 1][0]) < 10 &&
          Math.abs(el.path[0][1] - el.path[el.path.length - 1][1]) < 10
        ) {
          ctx.closePath();
          ctx.fill();
        }
        ctx.stroke();
        break;
      case RECTANGLE:
        drawRectangle(ctx, el.x1, el.y1, el.x2, el.y2);
        break;
      case CIRCLE:
        drawCircle(ctx, el.x1, el.y1, el.x2, el.y2);
        fillAndStroke(ctx);
        break;
      case DIAMOND:
        drawDiamond(ctx, el.x1, el.y1, el.x2, el.y2);
        fillAndStroke(ctx);
        break;
      case TRIANGLE:
        drawTriangle(ctx, el.x1, el.y1, el.x2, el.y2);
        fillAndStroke(ctx);
        break;
      case ARROW:
        drawArrow(ctx, el.x1, el.y1, el.x2, el.y2);
        break;
    }
    ctx.restore();
  }
  // Restore viewport (not strictly needed for offscreen)
  CanvasService.applyViewportTransform();
  return canvas;
}
import { TOOLS } from "../constants";
import { CanvasService, HistoryService, IndexedDBService } from "../services";
import { StorageService } from "../services/StorageService";
import {
  drawArrow,
  drawCircle,
  drawDiamond,
  drawRectangle,
  drawTriangle,
  fillAndStroke,
} from "./shapes";
import { drawText } from "./text";

const {
  RECTANGLE,
  TRIANGLE,
  CIRCLE,
  DIAMOND,
  LINE,
  ARROW,
  PENCIL,
  ADD_TEXT,
  ADD_IMAGE,
} = TOOLS;

/**
 * Redraws a single image element, using the in-memory cache when available.
 */
const redrawImage = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fileId: string
): Promise<void> | void => {
  const cached = HistoryService.getCachedImage(fileId);
  if (cached) {
    ctx.drawImage(cached, x, y, width, height);
    return;
  }

  return new Promise((resolve, reject) => {
    IndexedDBService.getFile(
      fileId,
      (result) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, x, y, width, height);
          HistoryService.setCachedImage(fileId, img);
          resolve();
        };
        img.src = result.dataUrl;
      },
      () => reject(new Error("Failed to load image from IndexedDB"))
    );
  });
};

/**
 * Iterates over all stored elements and redraws them onto the context.
 */
export const redrawAllElements = async (
  ctx: CanvasRenderingContext2D
): Promise<void> => {
  CanvasService.resetAndClear();
  const elements = StorageService.getElements();

  for (const el of elements) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = el.fillStyle;
    ctx.strokeStyle = el.strokeStyle;
    ctx.lineWidth = el.lineWidth;
    ctx.globalAlpha = el.globalAlpha;
    ctx.setLineDash(el.dash);
    ctx.beginPath();

    switch (el.type) {
      case ADD_IMAGE:
        await redrawImage(ctx, el.x1, el.y1, el.width, el.height, el.fileId);
        break;

      case ADD_TEXT:
        drawText(
          ctx,
          el.x1,
          el.y1 + el.lineWidth * 4.75,
          el.text,
          null,
          el.lineWidth,
          el.strokeStyle as string
        );
        break;

      case PENCIL:
        if (!el.path.length) break;
        ctx.moveTo(el.path[0][0], el.path[0][1]);
        el.path.forEach(([px, py]) => ctx.lineTo(px, py));
        ctx.stroke();
        break;

      case LINE:
        if (!el.path.length) break;
        ctx.moveTo(el.path[0][0], el.path[0][1]);
        el.path.forEach(([px, py]) => ctx.lineTo(px, py));
        if (
          Math.abs(el.path[0][0] - el.path[el.path.length - 1][0]) < 10 &&
          Math.abs(el.path[0][1] - el.path[el.path.length - 1][1]) < 10
        ) {
          ctx.closePath();
          ctx.fill();
        }
        ctx.stroke();
        break;

      case RECTANGLE:
        drawRectangle(ctx, el.x1, el.y1, el.x2, el.y2);
        break;

      case CIRCLE:
        drawCircle(ctx, el.x1, el.y1, el.x2, el.y2);
        fillAndStroke(ctx);
        break;

      case DIAMOND:
        drawDiamond(ctx, el.x1, el.y1, el.x2, el.y2);
        fillAndStroke(ctx);
        break;

      case TRIANGLE:
        drawTriangle(ctx, el.x1, el.y1, el.x2, el.y2);
        fillAndStroke(ctx);
        break;

      case ARROW:
        drawArrow(ctx, el.x1, el.y1, el.x2, el.y2);
        break;
    }
  }
};

/**
 * Destroys and recreates the canvas, then redraws all elements.
 */
export const redrawCanvas = (
  board: HTMLDivElement,
  onPointerDown: (e: PointerEvent) => void,
  onPointerUp: (e: PointerEvent) => void,
  onPointerMove: (e: PointerEvent) => void,
  onWheel?: (e: WheelEvent) => void
): void => {
  CanvasService.createCanvas(
    board,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onWheel
  );
  requestAnimationFrame(() => {
    redrawAllElements(CanvasService.getContext());
  });
};
