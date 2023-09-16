import { Coordinates, RectPointsTuple } from "../types/types";
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

  return Math.abs(d1 + d2 - lineLength) < 10; //0.1;
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

export const isPointOnEllipseBorder = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
) => {
  const dx = (x - centerX) / radiusX;
  const dy = (y - centerY) / radiusY;
  const distanceToEllipse = dx * dx + dy * dy;

  const threshold = 0.1;

  return (
    Math.abs(distanceToEllipse - 1) < threshold &&
    distanceToEllipse >= 1 - threshold
  );
};

export const isPointInsideEllipse = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
) => {
  // Calculate the normalized distance from the point to the ellipse center
  const dx = (x - centerX) / radiusX;
  const dy = (y - centerY) / radiusY;

  // Check if the point is inside the ellipse equation
  return dx * dx + dy * dy <= 1;
};

export const detectPointLocation = (
  x: number,
  y: number,
  selectedElement = "",
  selectedElementRect?: RectPointsTuple | undefined
) => {
  const data = getStorageData();

  if (data.length === 0) return -1;

  const point = { x, y };
  const reversedData = [...data].reverse();

  if (selectedElementRect) {
    const [x1, y1, width, height] = selectedElementRect;

    const x2 = x1 + width;
    const y2 = y1 + height;
    const polygon = [
      { x: x1, y: y1 },
      { x: x2, y: y1 },
      { x: x2, y: y2 },
      { x: x1, y: y2 },
    ];

    if (
      isPointOnShapeBoundary(point, polygon) ||
      isPointInsidePolygon(point, polygon)
    ) {
      return reversedData.findIndex(({ id }) => selectedElement === id);
    }
  }

  return reversedData.findIndex(
    ({ x1, x2, y1, y2, height, width, type, fillStyle, path, id }) => {
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
          const w = x2 - x1;
          const h = y2 - y1;
          polygon = [
            { x: x1 + w / 2, y: y1 },
            { x: x2, y: y2 - h / 2 },
            { x: x2 - w / 2, y: y2 },
            { x: x1, y: y1 + h / 2 },
          ];
        } else if (type === TRIANGLE) {
          const w = x2 - x1;

          polygon = [
            { x: x1 + w / 2, y: y1 },
            { x: x2, y: y2 },
            { x: (x1 + w / 2) * 2 - x2, y: y2 },
          ];
        } else if (type === LINE) {
          polygon = path.slice(0, -1).map(([x, y]) => ({ x, y }));
        }

        if (selectedElement === id) {
          return (
            isPointOnShapeBoundary(point, polygon) ||
            isPointInsidePolygon(point, polygon)
          );
        } else if (isInsideCheck(type, fillStyle as string)) {
          return isPointInsidePolygon(point, polygon);
        }
        return isPointOnShapeBoundary(point, polygon);
      } else if (type === CIRCLE) {
        const radiusX = (x2 - x1) / 2;
        const radiusY = (y2 - y1) / 2;
        const centerX = x1 + radiusX;
        const centerY = y1 + radiusY;

        if (selectedElement === id) {
          return (
            isPointInsideEllipse(x, y, centerX, centerY, radiusX, radiusY) ||
            isPointOnEllipseBorder(x, y, centerX, centerY, radiusX, radiusY)
          );
        } else if (fillStyle !== "rgba(0, 0, 0, 0)") {
          return isPointInsideEllipse(x, y, centerX, centerY, radiusX, radiusY);
        }
        return isPointOnEllipseBorder(x, y, centerX, centerY, radiusX, radiusY);
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
): { cursor: string; position: "tl" | "tr" | "bl" | "br" } | false => {
  if (Math.abs(x - x1) <= 5 && Math.abs(y - y1) <= 5) {
    return { cursor: "nwse-resize", position: "tl" };
  } else if (Math.abs(x - x1 - w) <= 5 && Math.abs(y - y1 - h) <= 5) {
    return { cursor: "nwse-resize", position: "br" };
  } else if (Math.abs(x - x1 - w) <= 5 && Math.abs(y - y1) <= 5) {
    return { cursor: "nesw-resize", position: "tr" };
  } else if (Math.abs(x - x1) <= 5 && Math.abs(y - y1 - h) <= 5) {
    return { cursor: "nesw-resize", position: "bl" };
  }
  return false;
};

export const isPointerOnReverseTriangleRectangleCorner = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  w: number,
  h: number
): { cursor: string; position: "tl" | "tr" | "bl" | "br" } | false => {
  if (Math.abs(x - x1) <= 5 && Math.abs(y - y1) <= 5) {
    return { cursor: "nesw-resize", position: "bl" };
  } else if (Math.abs(x - x1 - w) <= 5 && Math.abs(y - y1 - h) <= 5) {
    return { cursor: "nesw-resize", position: "tr" };
  } else if (Math.abs(x - x1 - w) <= 5 && Math.abs(y - y1) <= 5) {
    return { cursor: "nwse-resize", position: "br" };
  } else if (Math.abs(x - x1) <= 5 && Math.abs(y - y1 - h) <= 5) {
    return { cursor: "nwse-resize", position: "tl" };
  }
  return false;
};

export const isPointerOnArrowCorner = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  w: number,
  h: number
): { cursor: string; position: "tl" | "tr" | "bl" | "br" } | false => {
  if (Math.abs(x - x1) <= 5 && Math.abs(y - y1) <= 5) {
    return { cursor: "nesw-resize", position: "bl" };
  } else if (Math.abs(x - x1 - w) <= 5 && Math.abs(y - y1 - h) <= 5) {
    return { cursor: "nesw-resize", position: "tr" };
  } else if (Math.abs(x - x1 - w) <= 5 && Math.abs(y - y1) <= 5) {
    return { cursor: "nwse-resize", position: "br" };
  } else if (Math.abs(x - x1) <= 5 && Math.abs(y - y1 - h) <= 5) {
    return { cursor: "nwse-resize", position: "tl" };
  }
  return false;
};
