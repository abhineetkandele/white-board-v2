import { RectPointsTuple } from "../types/types";

export const recreateContext = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas.getBoundingClientRect();
  const { devicePixelRatio: ratio = 1 } = window;
  canvas.style.width = String(width);
  canvas.style.height = String(height);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.scale(ratio, ratio);

  return ctx;
};

export const moveRectangle = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  w: number,
  h: number
) => {
  ctx.strokeStyle = "#0000ff";
  ctx.lineWidth = 1;
  ctx.lineJoin = "miter";
  ctx.miterLimit = 10;

  const isNegativeWidth = w < 0;
  const isNegativeHeight = h < 0;

  ctx.setLineDash([5, 5]);
  ctx.strokeRect(
    x1 - (isNegativeWidth ? -5 : 5),
    y1 - (isNegativeHeight ? -5 : 5),
    w + (isNegativeWidth ? -10 : 10),
    h + (isNegativeHeight ? -10 : 10)
  );
  ctx.fillStyle = "#ffffff";
  ctx.setLineDash([]);

  const point1: RectPointsTuple = [
    x1 - (isNegativeWidth ? -2 : 8),
    y1 - (isNegativeHeight ? -2 : 8),
    6,
    6,
  ];
  ctx.fillRect(...point1);
  ctx.strokeRect(...point1);

  const point2: RectPointsTuple = [
    x2 + (isNegativeWidth ? -8 : 2),
    y1 - (isNegativeHeight ? -2 : 8),
    6,
    6,
  ];
  ctx.fillRect(...point2);
  ctx.strokeRect(...point2);

  const point3: RectPointsTuple = [
    x2 + (isNegativeWidth ? -8 : 2),
    y2 + (isNegativeHeight ? -8 : 2),
    6,
    6,
  ];
  ctx.fillRect(...point3);
  ctx.strokeRect(...point3);

  const point4: RectPointsTuple = [
    x1 - (isNegativeWidth ? -2 : 8),
    y2 + (isNegativeHeight ? -8 : 2),
    6,
    6,
  ];
  ctx.fillRect(...point4);
  ctx.strokeRect(...point4);
};
