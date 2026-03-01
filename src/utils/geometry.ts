/**
 * Computes the bounding box (minX, minY, maxX, maxY) of all board elements.
 * Returns {x1, y1, x2, y2, width, height} in world coordinates.
 */
import type { BoardElement } from "../types";
export function getBoardBoundingBox(elements: BoardElement[]) {
  if (!elements.length)
    return { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const el of elements) {
    // For path-based elements, check all path points
    if (el.path && el.path.length) {
      for (const [x, y] of el.path) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    // For shapes, use x1/y1/x2/y2/width/height
    if (typeof el.x1 === "number" && typeof el.y1 === "number") {
      minX = Math.min(minX, el.x1);
      minY = Math.min(minY, el.y1);
    }
    if (typeof el.x2 === "number" && typeof el.y2 === "number") {
      maxX = Math.max(maxX, el.x2);
      maxY = Math.max(maxY, el.y2);
    }
    if (typeof el.width === "number" && typeof el.height === "number") {
      maxX = Math.max(maxX, el.x1 + el.width);
      maxY = Math.max(maxY, el.y1 + el.height);
    }
  }
  return {
    x1: minX,
    y1: minY,
    x2: maxX,
    y2: maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
import type {
  BoundingRect,
  Coordinates,
  CornerHit,
  RectPointsTuple,
} from "../types";
import { TOOLS } from "../constants";
import { StorageService } from "../services";

const {
  RECTANGLE,
  TRIANGLE,
  DIAMOND,
  LINE,
  ADD_TEXT,
  ADD_IMAGE,
  CIRCLE,
  ARROW,
  PENCIL,
} = TOOLS;

// ─── Primitive geometry helpers ─────────────────────────────────────

export const distance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

export const isPointOnLine = (
  point: Coordinates,
  lineStart: Coordinates,
  lineEnd: Coordinates
): boolean => {
  const d1 = distance(point.x, point.y, lineStart.x, lineStart.y);
  const d2 = distance(point.x, point.y, lineEnd.x, lineEnd.y);
  const lineLen = distance(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
  return Math.abs(d1 + d2 - lineLen) < 1;
};

export const isPointInsidePolygon = (
  point: Coordinates,
  polygon: Coordinates[]
): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { x: xi, y: yi } = polygon[i];
    const { x: xj, y: yj } = polygon[j];
    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

export const isPointOnShapeBoundary = (
  point: Coordinates,
  shape: Coordinates[]
): boolean => {
  for (let i = 0; i < shape.length; i++) {
    if (isPointOnLine(point, shape[i], shape[(i + 1) % shape.length])) {
      return true;
    }
  }
  return false;
};

export const isPointOnEllipseBorder = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): boolean => {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  const d = dx * dx + dy * dy;
  const threshold = 0.1;
  return Math.abs(d - 1) < threshold && d >= 1 - threshold;
};

export const isPointInsideEllipse = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): boolean => {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
};

// ─── Bounding rectangle for free-form paths ─────────────────────────

export const createBoundingRect = (coords: number[][]): BoundingRect => {
  let minX = coords[0][0];
  let minY = coords[0][1];
  let maxX = coords[0][0];
  let maxY = coords[0][1];

  for (let i = 1; i < coords.length; i++) {
    minX = Math.min(minX, coords[i][0]);
    minY = Math.min(minY, coords[i][1]);
    maxX = Math.max(maxX, coords[i][0]);
    maxY = Math.max(maxY, coords[i][1]);
  }

  return {
    x1: minX,
    y1: minY,
    x2: maxX,
    y2: maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// ─── Closed polygon checks ──────────────────────────────────────────

const CLOSED_POLYGON_TYPES: string[] = [
  RECTANGLE,
  TRIANGLE,
  DIAMOND,
  ADD_IMAGE,
  ADD_TEXT,
];

export const isClosedLine = (path: number[][]): boolean => {
  const last = path.length - 1;
  return path[0][0] === path[last][0] && path[0][1] === path[last][1];
};

export const isClosedPolygon = (type: string, path: number[][]): boolean => {
  return (
    CLOSED_POLYGON_TYPES.includes(type) || (type === LINE && isClosedLine(path))
  );
};

export const hasFilledInterior = (type: string, fillStyle: string): boolean => {
  return (
    type === ADD_IMAGE ||
    type === ADD_TEXT ||
    ((CLOSED_POLYGON_TYPES.includes(type) || type === LINE) &&
      fillStyle !== "rgba(0, 0, 0, 0)")
  );
};

// ─── Build polygon vertices for a given element type ────────────────

const buildPolygonForType = (
  type: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  height: number,
  path: number[][]
): Coordinates[] => {
  if (type === RECTANGLE || type === ADD_IMAGE || type === ADD_TEXT) {
    const ex2 = x2 || x1 + width;
    const ey2 = y2 || y1 + height;
    return [
      { x: x1, y: y1 },
      { x: ex2, y: y1 },
      { x: ex2, y: ey2 },
      { x: x1, y: ey2 },
    ];
  }
  if (type === DIAMOND) {
    const w = x2 - x1;
    const h = y2 - y1;
    return [
      { x: x1 + w / 2, y: y1 },
      { x: x2, y: y2 - h / 2 },
      { x: x2 - w / 2, y: y2 },
      { x: x1, y: y1 + h / 2 },
    ];
  }
  if (type === TRIANGLE) {
    const w = x2 - x1;
    return [
      { x: x1 + w / 2, y: y1 },
      { x: x2, y: y2 },
      { x: (x1 + w / 2) * 2 - x2, y: y2 },
    ];
  }
  if (type === LINE) {
    return path.slice(0, -1).map(([px, py]) => ({ x: px, y: py }));
  }
  return [];
};

// ─── Hit detection: find which element is under the pointer ─────────

export const detectElementAtPoint = (
  x: number,
  y: number,
  selectedElement = "",
  selectedElementRect?: RectPointsTuple
): number => {
  const data = StorageService.getElements();
  if (data.length === 0) return -1;

  const point: Coordinates = { x, y };
  const reversed = [...data].reverse();

  // Check selected element's bounding box first
  if (selectedElementRect) {
    const [rx1, ry1, rw, rh] = selectedElementRect;
    const rx2 = rx1 + rw;
    const ry2 = ry1 + rh;
    const polygon = [
      { x: rx1, y: ry1 },
      { x: rx2, y: ry1 },
      { x: rx2, y: ry2 },
      { x: rx1, y: ry2 },
    ];
    if (
      isPointOnShapeBoundary(point, polygon) ||
      isPointInsidePolygon(point, polygon)
    ) {
      return reversed.findIndex(({ id }) => selectedElement === id);
    }
  }

  return reversed.findIndex(
    ({ x1, x2, y1, y2, height, width, type, fillStyle, path, id }) => {
      // Closed polygon types
      if (isClosedPolygon(type, path)) {
        const polygon = buildPolygonForType(
          type,
          x1,
          y1,
          x2,
          y2,
          width,
          height,
          path
        );
        if (selectedElement === id) {
          return (
            isPointOnShapeBoundary(point, polygon) ||
            isPointInsidePolygon(point, polygon)
          );
        }
        if (hasFilledInterior(type, fillStyle as string)) {
          return isPointInsidePolygon(point, polygon);
        }
        return isPointOnShapeBoundary(point, polygon);
      }

      // Ellipse (circle)
      if (type === CIRCLE) {
        const rx = (x2 - x1) / 2;
        const ry = (y2 - y1) / 2;
        const cx = x1 + rx;
        const cy = y1 + ry;
        if (selectedElement === id) {
          return (
            isPointInsideEllipse(x, y, cx, cy, rx, ry) ||
            isPointOnEllipseBorder(x, y, cx, cy, rx, ry)
          );
        }
        if (fillStyle !== "rgba(0, 0, 0, 0)") {
          return isPointInsideEllipse(x, y, cx, cy, rx, ry);
        }
        return isPointOnEllipseBorder(x, y, cx, cy, rx, ry);
      }

      // Pencil (proximity check)
      if (type === PENCIL) {
        return path.some(
          ([px, py]) => Math.abs(px - x) < 5 && Math.abs(py - y) < 5
        );
      }

      // Open line (point-on-segment check)
      if (type === LINE) {
        return path.some(([px, py], i) => {
          const next = path[i + 1];
          if (!next) return false;
          return isPointOnLine(
            point,
            { x: px, y: py },
            { x: next[0], y: next[1] }
          );
        });
      }

      // Arrow
      if (type === ARROW) {
        const t = 0.9;
        const arrow = { dx: x2 - x1, dy: y2 - y1 };
        const mid = { x: arrow.dx * t + x1, y: arrow.dy * t + y1 };
        const tip = { dx: x2 - mid.x, dy: y2 - mid.y };

        const p1: Coordinates = { x: x1, y: y1 };
        const p2: Coordinates = { x: x2, y: y2 };
        const p3: Coordinates = {
          x: mid.x + 0.5 * tip.dy,
          y: mid.y - 0.5 * tip.dx,
        };
        const p4: Coordinates = {
          x: mid.x - 0.5 * tip.dy,
          y: mid.y + 0.5 * tip.dx,
        };

        return (
          isPointOnLine(point, p1, p2) ||
          isPointOnLine(point, p2, p3) ||
          isPointOnLine(point, p2, p4)
        );
      }

      return false;
    }
  );
};

// ─── Corner hit detection for resize handles ────────────────────────

const CORNER_THRESHOLD = 5;

export const getCornerAtPoint = (
  x: number,
  y: number,
  rx: number,
  ry: number,
  w: number,
  h: number
): CornerHit | null => {
  if (
    Math.abs(x - rx) <= CORNER_THRESHOLD &&
    Math.abs(y - ry) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nwse-resize", position: "tl" };
  }
  if (
    Math.abs(x - rx - w) <= CORNER_THRESHOLD &&
    Math.abs(y - ry - h) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nwse-resize", position: "br" };
  }
  if (
    Math.abs(x - rx - w) <= CORNER_THRESHOLD &&
    Math.abs(y - ry) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nesw-resize", position: "tr" };
  }
  if (
    Math.abs(x - rx) <= CORNER_THRESHOLD &&
    Math.abs(y - ry - h) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nesw-resize", position: "bl" };
  }
  return null;
};

export const getReverseTriangleCornerAtPoint = (
  x: number,
  y: number,
  rx: number,
  ry: number,
  w: number,
  h: number
): CornerHit | null => {
  if (
    Math.abs(x - rx) <= CORNER_THRESHOLD &&
    Math.abs(y - ry) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nesw-resize", position: "bl" };
  }
  if (
    Math.abs(x - rx - w) <= CORNER_THRESHOLD &&
    Math.abs(y - ry - h) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nesw-resize", position: "tr" };
  }
  if (
    Math.abs(x - rx - w) <= CORNER_THRESHOLD &&
    Math.abs(y - ry) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nwse-resize", position: "br" };
  }
  if (
    Math.abs(x - rx) <= CORNER_THRESHOLD &&
    Math.abs(y - ry - h) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nwse-resize", position: "tl" };
  }
  return null;
};

export const getArrowCornerAtPoint = (
  x: number,
  y: number,
  rx: number,
  ry: number,
  w: number,
  h: number
): CornerHit | null => {
  if (
    Math.abs(x - rx) <= CORNER_THRESHOLD &&
    Math.abs(y - ry) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nesw-resize", position: "bl" };
  }
  if (
    Math.abs(x - rx - w) <= CORNER_THRESHOLD &&
    Math.abs(y - ry - h) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nesw-resize", position: "tr" };
  }
  if (
    Math.abs(x - rx - w) <= CORNER_THRESHOLD &&
    Math.abs(y - ry) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nwse-resize", position: "br" };
  }
  if (
    Math.abs(x - rx) <= CORNER_THRESHOLD &&
    Math.abs(y - ry - h) <= CORNER_THRESHOLD
  ) {
    return { cursor: "nwse-resize", position: "tl" };
  }
  return null;
};
