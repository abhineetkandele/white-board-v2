import { Coordinates } from "../types/types";
import { TOP_PANEL_OPTIONS } from "./constants";
import { getStorageData } from "./utils";

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
} = TOP_PANEL_OPTIONS;

export const isPointInsidePolygon = (
  point: Coordinates,
  polygon: Coordinates[]
) => {
  const { x, y } = point;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) isInside = !isInside;
  }

  return isInside;
};

export const isPointOnShapeBoundary = (
  point: Coordinates,
  shape: Coordinates[]
) => {
  for (let i = 0; i < shape.length; i++) {
    const p1 = shape[i];
    const p2 = shape[(i + 1) % shape.length];

    if (isPointOnLine(point, p1, p2)) {
      return true;
    }
  }
  return false;
};

export const isPointOnLine = (
  point: Coordinates,
  lineStart: Coordinates,
  lineEnd: Coordinates
) => {
  const { x, y } = point;
  const { x: x1, y: y1 } = lineStart;
  const { x: x2, y: y2 } = lineEnd;

  const d1 = distance(x, y, x1, y1);
  const d2 = distance(x, y, x2, y2);

  const lineLength = distance(x1, y1, x2, y2);

  return Math.abs(d1 + d2 - lineLength) < 0.1;
};

export const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

const CLOSED_POLYGONS = [RECTANGLE, TRIANGLE, DIAMOND, ADD_IMAGE, ADD_TEXT];

export const isClosedLine = (path: number[][]) => {
  const lastPath = path.length - 1;

  return path[0][0] === path[lastPath][0] && path[0][1] === path[lastPath][1];
};

export const isClosedPolygon = (type: string, path: number[][]) => {
  if (CLOSED_POLYGONS.includes(type) || (type === LINE && isClosedLine(path)))
    return true;

  return false;
};

export const isInsideCheck = (type: string, fillStyle: string) => {
  if (
    type === ADD_IMAGE ||
    type === ADD_TEXT ||
    ((CLOSED_POLYGONS.includes(type) || type === LINE) &&
      fillStyle !== "rgba(0, 0, 0, 0)")
  )
    return true;

  return false;
};

export const isPointOnCircle = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  r: number
) => {
  const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));

  return Math.abs(distance - r) < 1;
};

export const isPointInsideCircle = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  r: number
) => {
  const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));

  return distance < r;
};

export const detectPointLocation = (
  x: number,
  y: number,
  selectedElement = ""
) => {
  const data = getStorageData();

  if (data.length === 0) return -1;

  const reversedData = [...data].reverse();

  return reversedData.findIndex(
    ({ x1, x2, y1, y2, height, width, type, fillStyle, path, id }) => {
      const point = { x, y };

      if (isClosedPolygon(type, path)) {
        let polygon: Coordinates[] = [];

        if (type === RECTANGLE || type === ADD_IMAGE || type === ADD_TEXT) {
          if (!x2) {
            x2 = x1 + width;
          }
          if (!y2) {
            y2 = y1 + height;
          }
          polygon = [
            { x: x1, y: y1 },
            { x: x2, y: y1 },
            { x: x2, y: y2 },
            { x: x1, y: y2 },
          ];
        } else if (type === DIAMOND) {
          polygon = [
            { x: x1, y: y1 },
            { x: x2, y: y2 },
            { x: x1, y: y1 + (y2 - y1) * 2 },
            { x: x1 * 2 - x2, y: y2 },
          ];
        } else if (type === TRIANGLE) {
          polygon = [
            { x: x1, y: y1 },
            { x: x2, y: y2 },
            { x: x1 * 2 - x2, y: y2 },
          ];
        } else if (type === LINE) {
          polygon = path.slice(0, -1).map(([x, y]) => ({ x, y }));
        }

        if (
          isInsideCheck(type, fillStyle as string) ||
          selectedElement === id
        ) {
          return isPointInsidePolygon(point, polygon);
        }
        return isPointOnShapeBoundary(point, polygon);
      } else if (type === CIRCLE) {
        const radius = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

        if (fillStyle !== "rgba(0, 0, 0, 0)") {
          return isPointInsideCircle(x, y, x1, y1, radius);
        }
        return isPointOnCircle(x, y, x1, y1, radius);
      } else if (type === PENCIL) {
        const index = path.findIndex(([x1, y1]) => {
          return Math.abs(x1 - x) < 5 && Math.abs(y1 - y) < 5;
        });

        return index >= 0;
      } else if (type === LINE) {
        const index = path.findIndex(([x1, y1], index) => {
          const point1 = { x: x1, y: y1 };
          const point2 = { x: path[index + 1]?.[0], y: path[index + 1]?.[1] };
          return isPointOnLine(point, point1, point2);
        });

        return index >= 0;
      } else if (type === ARROW) {
        const arrow = {
          dx: x2 - x1,
          dy: y2 - y1,
        };
        const t = 0.9;
        const middle = {
          x: arrow.dx * t + x1,
          y: arrow.dy * t + y1,
        };
        const tip = {
          dx: x2 - middle.x,
          dy: y2 - middle.y,
        };

        const point1 = { x: x1, y: y1 };
        const point2 = { x: x2, y: y2 };
        const point3 = {
          x: middle.x + 0.5 * tip.dy,
          y: middle.y - 0.5 * tip.dx,
        };
        const point4 = {
          x: middle.x - 0.5 * tip.dy,
          y: middle.y + 0.5 * tip.dx,
        };

        return (
          isPointOnLine(point, point1, point2) ||
          isPointOnLine(point, point2, point3) ||
          isPointOnLine(point, point2, point4)
        );
      }
    }
  );
};

export const isPointerOnRectangleCorner = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  w: number,
  h: number
) => {
  if (
    (Math.abs(x - x1) <= 5 && Math.abs(y - y1) <= 5) ||
    (Math.abs(x - x1 - w) <= 5 && Math.abs(y - y1 - h) <= 5)
  ) {
    return "nwse-resize";
  } else if (
    (Math.abs(x - x1 - w) <= 5 && Math.abs(y - y1) <= 5) ||
    (Math.abs(x - x1) <= 5 && Math.abs(y - y1 - h) <= 5)
  ) {
    return "nesw-resize";
  }
  return false;
};
