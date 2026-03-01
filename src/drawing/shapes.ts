/**
 * Pure drawing functions for each shape type.
 * Each function only issues canvas draw commands — no state or storage side effects.
 */

export const drawRectangle = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void => {
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
};

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  xCord: number,
  yCord: number,
): void => {
  let x1 = x;
  let y1 = y;
  let x2 = xCord;
  let y2 = yCord;

  if (x1 > x2 && y1 < y2) {
    x1 = xCord;
    x2 = x;
  } else if (x1 < x2 && y1 > y2) {
    y1 = yCord;
    y2 = y;
  } else if (x1 > x2 && y1 > y2) {
    x1 = xCord;
    y1 = yCord;
    x2 = x;
    y2 = y;
  }

  const radiusX = (x2 - x1) / 2;
  const radiusY = (y2 - y1) / 2;

  ctx.beginPath();
  ctx.ellipse(
    x1 + radiusX,
    y1 + radiusY,
    radiusX,
    radiusY,
    0,
    0,
    Math.PI * 2,
    false,
  );
};

export const drawDiamond = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void => {
  const w = x2 - x1;
  const h = y2 - y1;

  ctx.beginPath();
  ctx.moveTo(x1 + w / 2, y1);
  ctx.lineTo(x2, y2 - h / 2);
  ctx.lineTo(x2 - w / 2, y2);
  ctx.lineTo(x1, y1 + h / 2);
  ctx.closePath();
};

export const drawTriangle = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void => {
  const w = x2 - x1;

  ctx.beginPath();
  ctx.moveTo(x1 + w / 2, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo((x1 + w / 2) * 2 - x2, y2);
  ctx.closePath();
};

export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t = 0.9,
): void => {
  const arrow = { dx: x2 - x1, dy: y2 - y1 };
  const middle = { x: arrow.dx * t + x1, y: arrow.dy * t + y1 };
  const tip = { dx: x2 - middle.x, dy: y2 - middle.y };

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(middle.x + 0.5 * tip.dy, middle.y - 0.5 * tip.dx);
  ctx.moveTo(x2, y2);
  ctx.lineTo(middle.x - 0.5 * tip.dy, middle.y + 0.5 * tip.dx);
  ctx.closePath();
  ctx.stroke();
};

export const fillAndStroke = (ctx: CanvasRenderingContext2D): void => {
  ctx.fill();
  ctx.stroke();
};
