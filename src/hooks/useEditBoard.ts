import { PointerEvent, WheelEvent, useContext, useRef } from "react";
import { AppContext } from "../context";
import { TOOLS } from "../constants";
import { LINE_DASH_REVERSE } from "../constants/styles";
import { CanvasService, StorageService } from "../services";
import type { RectPointsTuple, ResizeCorner, StrokePattern } from "../types";
import {
  getPointerCoords,
  detectElementAtPoint,
  createBoundingRect,
  getCornerAtPoint,
  getReverseTriangleCornerAtPoint,
  getArrowCornerAtPoint,
  recreateEditContext,
  drawSelectionBox,
} from "../utils";
import { redrawAllElements } from "../drawing";

const {
  RECTANGLE,
  TRIANGLE,
  CIRCLE,
  DIAMOND,
  LINE,
  ARROW,
  ADD_IMAGE,
  ADD_TEXT,
  PENCIL,
} = TOOLS;

export const useEditBoard = (handleResize: () => void) => {
  const [{ selectedElement }, setState] = useContext(AppContext);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectedRect = useRef<RectPointsTuple>();
  const isEditing = useRef(false);
  const isPanning = useRef(false);
  const resizeCorner = useRef<ResizeCorner | undefined>();
  const lastCoords = useRef<{ xCord: number; yCord: number }>();
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ─── Helpers ──────────────────────────────────────────────────────

  const computeBoundingRect = (
    item: ReturnType<typeof StorageService.getElements>[number]
  ) => {
    let x1: number, y1: number, x2: number, y2: number, w: number, h: number;

    if (
      ([RECTANGLE, CIRCLE, DIAMOND, ARROW, TRIANGLE] as string[]).includes(
        item.type
      )
    ) {
      x1 = item.x1;
      y1 = item.y1;
      x2 = item.x2;
      y2 = item.y2;
      w = x2 - x1;
      h = y2 - y1;
    } else if (item.type === PENCIL || item.type === LINE) {
      const rect = createBoundingRect(item.path);
      x1 = rect.x1;
      y1 = rect.y1;
      x2 = rect.x2;
      y2 = rect.y2;
      w = rect.width;
      h = rect.height;
    } else {
      x1 = item.x1;
      y1 = item.y1;
      w = item.width;
      h = item.height;
      x2 = x1 + w;
      y2 = y1 + h;
    }

    return { x1, y1, x2, y2, w, h };
  };

  const buildSelectionRect = (
    w: number,
    h: number,
    x1: number,
    y1: number
  ): RectPointsTuple => {
    const negW = w < 0;
    const negH = h < 0;
    return [
      x1 - (negW ? -5 : 5),
      y1 - (negH ? -5 : 5),
      w + (negW ? -10 : 10),
      h + (negH ? -10 : 10),
    ];
  };

  const redrawSelectionOverlay = () => {
    const editCanvas = editCanvasRef.current;
    if (!editCanvas || !selectedElement) return;

    const storage = StorageService.getElements();
    const index = storage.findIndex((el) => el.id === selectedElement);
    if (index < 0) return;

    const item = storage[index];
    const { x1, y1, x2, y2, w, h } = computeBoundingRect(item);
    selectedRect.current = buildSelectionRect(w, h, x1, y1);

    const ctx = recreateEditContext(editCanvas);
    drawSelectionBox(ctx, x1, y1, x2, y2, w, h);
  };

  // ─── Pointer down: select element ─────────────────────────────────

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.button === 2 || e.shiftKey) {
      isPanning.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button !== 0) return;

    const { xCord, yCord } = getPointerCoords(e, false);
    const editCanvas = editCanvasRef.current!;
    const index = detectElementAtPoint(
      xCord,
      yCord,
      selectedElement,
      selectedRect.current
    );

    if (index >= 0) {
      const storage = StorageService.getElements();
      const ctx = recreateEditContext(editCanvas);
      const item = storage.at(-1 - index)!;
      const { x1, y1, x2, y2, w, h } = computeBoundingRect(item);

      selectedRect.current = buildSelectionRect(w, h, x1, y1);
      drawSelectionBox(ctx, x1, y1, x2, y2, w, h);

      const dashValue = item.dash.toString() as "" | "10,15" | "1,15";
      setState({
        selectedElement: item.id,
        strokeStyle: item.strokeStyle as string,
        fillStyle: item.fillStyle as string,
        lineWidth: item.lineWidth,
        globalAlpha: item.globalAlpha * 100,
        strokePattern: LINE_DASH_REVERSE[dashValue] as StrokePattern,
      });

      isEditing.current = true;
      lastCoords.current = { xCord, yCord };

      const corner = getCornerAtPoint(xCord, yCord, ...selectedRect.current!);
      if (corner) resizeCorner.current = corner.position;
    } else {
      recreateEditContext(editCanvas);
      setState({ selectedElement: "" });
      selectedRect.current = undefined;
      resizeCorner.current = undefined;
    }
  };

  // ─── Pointer up ───────────────────────────────────────────────────

  const onPointerUp = () => {
    if (isPanning.current) {
      isPanning.current = false;
      return;
    }

    isEditing.current = false;
    resizeCorner.current = undefined;
  };

  // ─── Pointer move: cursor + drag/resize ───────────────────────────

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      panStartRef.current = { x: e.clientX, y: e.clientY };
      CanvasService.panBy(dx, dy);
      redrawAllElements(CanvasService.getContext());
      redrawSelectionOverlay();
      return;
    }

    const { xCord, yCord } = getPointerCoords(e, false);
    const editCanvas = editCanvasRef.current!;

    // Cursor style based on hover
    const elIndex = detectElementAtPoint(
      xCord,
      yCord,
      selectedElement,
      selectedRect.current
    );
    editCanvas.style.cursor = elIndex >= 0 ? "move" : "default";

    const storage = StorageService.getElements();
    const index = storage.findIndex((el) => el.id === selectedElement);
    if (index < 0) return;

    const item = storage[index];

    // Corner cursor detection
    if (selectedRect.current) {
      let cornerHit;
      if (item.type === TRIANGLE && item.y1 > item.y2) {
        cornerHit =
          selectedElement &&
          getReverseTriangleCornerAtPoint(
            xCord,
            yCord,
            ...selectedRect.current
          );
      } else if (item.type === ARROW) {
        const { x1, x2, y1, y2 } = item;
        if ((y1 > y2 && x2 > x1) || (x1 > x2 && y2 > y1)) {
          cornerHit =
            selectedElement &&
            getArrowCornerAtPoint(xCord, yCord, ...selectedRect.current);
        } else {
          cornerHit =
            selectedElement &&
            getCornerAtPoint(xCord, yCord, ...selectedRect.current);
        }
      } else {
        cornerHit =
          selectedElement &&
          getCornerAtPoint(xCord, yCord, ...selectedRect.current);
      }
      if (cornerHit) editCanvas.style.cursor = cornerHit.cursor;
    }

    // Drag / resize logic
    if (!isEditing.current) return;

    const { xCord: prevX, yCord: prevY } = lastCoords.current!;
    const xDiff = xCord - prevX;
    const yDiff = yCord - prevY;
    const pos = resizeCorner.current;

    // Apply transformations based on element type
    if (
      ([RECTANGLE, CIRCLE, DIAMOND, ARROW, TRIANGLE] as string[]).includes(
        item.type
      )
    ) {
      applyShapeTransform(item, pos, xDiff, yDiff);
    } else if (item.type === ADD_IMAGE) {
      applyImageTransform(item, pos, xDiff, yDiff);
    } else if (item.type === ADD_TEXT) {
      applyTextTransform(item, pos, xDiff, yDiff);
    } else if (item.type === PENCIL || item.type === LINE) {
      applyPathTransform(item, pos, xDiff, yDiff);
    }

    // Recompute bounding rect and redraw
    const bounds = computeBoundingRect(item);
    const { x1: xa, y1: ya, x2: xb, y2: yb, w, h } = bounds;

    const isValid =
      (item.type === TRIANGLE && item.x2 > xa) ||
      item.type === ARROW ||
      item.type === PENCIL ||
      item.type === LINE ||
      (item.x2 > xa && item.y2 > ya) ||
      (item.height > 0 && item.width > 0);

    if (isValid) {
      selectedRect.current = buildSelectionRect(w, h, xa, ya);
      storage[index] = item;
      StorageService.setElements(storage);
      handleResize();
      const ctx = recreateEditContext(editCanvas);
      drawSelectionBox(ctx, xa, ya, xb, yb, w, h);
      lastCoords.current = { xCord, yCord };
    }
  };

  const onWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (e.metaKey || e.ctrlKey) {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      CanvasService.zoomAt(x, y, zoomFactor);
    } else {
      CanvasService.panBy(-e.deltaX, -e.deltaY);
    }

    redrawAllElements(CanvasService.getContext());
    redrawSelectionOverlay();
  };

  return { editCanvasRef, onPointerDown, onPointerUp, onPointerMove, onWheel };
};

// ─── Transform helpers (pure mutations on item) ───────────────────────

function applyShapeTransform(
  item: { x1: number; y1: number; x2: number; y2: number },
  pos: ResizeCorner | undefined,
  dx: number,
  dy: number
) {
  if (!pos) {
    item.x1 += dx;
    item.x2 += dx;
    item.y1 += dy;
    item.y2 += dy;
  } else if (pos === "tl") {
    item.x1 += dx;
    item.y1 += dy;
  } else if (pos === "br") {
    item.x2 += dx;
    item.y2 += dy;
  } else if (pos === "bl") {
    item.x1 += dx;
    item.y2 += dy;
  } else {
    item.x2 += dx;
    item.y1 += dy;
  }
}

function applyImageTransform(
  item: { x1: number; y1: number; width: number; height: number },
  pos: ResizeCorner | undefined,
  dx: number,
  dy: number
) {
  if (!pos) {
    item.x1 += dx;
    item.y1 += dy;
  } else if (pos === "tl") {
    item.x1 += dx;
    item.y1 += dy;
    item.width -= dx;
    item.height -= dy;
  } else if (pos === "br") {
    item.width += dx;
    item.height += dy;
  } else if (pos === "bl") {
    item.x1 += dx;
    item.width -= dx;
    item.height += dy;
  } else {
    item.width += dx;
    item.height -= dy;
    item.y1 += dy;
  }
}

function applyTextTransform(
  item: {
    x1: number;
    y1: number;
    width: number;
    height: number;
    lineWidth: number;
  },
  pos: ResizeCorner | undefined,
  dx: number,
  dy: number
) {
  if (!pos) {
    item.x1 += dx;
    item.y1 += dy;
    return;
  }

  const aspectRatio = item.width / item.height;
  const lwRatio = item.width / item.lineWidth;

  if (pos === "tl") {
    item.lineWidth -= dx / lwRatio;
    item.x1 += dx;
    item.y1 += dy;
    item.width -= dx;
    item.height = item.width / aspectRatio;
  } else if (pos === "br") {
    item.lineWidth += dx / lwRatio;
    item.width += dx;
    item.height = item.width / aspectRatio;
  } else if (pos === "bl") {
    item.lineWidth -= dx / lwRatio;
    item.x1 += dx;
    item.width -= dx;
    item.height = item.width / aspectRatio;
  } else {
    item.lineWidth += dx / lwRatio;
    item.width += dx;
    item.height = item.width / aspectRatio;
    item.y1 += dy;
  }
}

function applyPathTransform(
  item: { path: number[][] },
  pos: ResizeCorner | undefined,
  dx: number,
  dy: number
) {
  if (!pos) {
    item.path = item.path.map(([x, y]) => [x + dx, y + dy]);
    return;
  }

  const { x1, y1, width, height } = createBoundingRect(item.path);
  let newW: number, newH: number, newX: number, newY: number;

  if (pos === "tl") {
    newW = width - dx;
    newH = height - dy;
    newX = x1 + dx;
    newY = y1 + dy;
  } else if (pos === "br") {
    newW = width + dx;
    newH = height + dy;
    newX = x1;
    newY = y1;
  } else if (pos === "bl") {
    newW = width - dx;
    newH = height + dy;
    newX = x1 + dx;
    newY = y1;
  } else {
    newW = width + dx;
    newH = height - dy;
    newX = x1;
    newY = y1 + dy;
  }

  const ws = newW / width;
  const hs = newH / height;
  const xt = newX - x1;
  const yt = newY - y1;

  item.path = item.path.map(([x, y]) => [
    x1 + (x - x1) * ws + xt,
    y1 + (y - y1) * hs + yt,
  ]);
}
