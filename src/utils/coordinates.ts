import React from "react";
import { CanvasService } from "../services";

/**
 * Extracts pointer coordinates from a PointerEvent.
 * When `round` is true (default), floors values for pixel-perfect drawing.
 */
export const getPointerCoords = (
  e: PointerEvent | React.PointerEvent<HTMLCanvasElement>,
  round = true,
  mode: "world" | "screen" = "world"
): { xCord: number; yCord: number } => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;
  const { x, y } =
    mode === "world"
      ? CanvasService.screenToWorld(screenX, screenY)
      : { x: screenX, y: screenY };

  const xCord = round ? Math.floor(x) : x;
  const yCord = round ? Math.floor(y) : y;
  return { xCord, yCord };
};

export const hex2rgb = (hex: string): { r: number; g: number; b: number } => {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
};
