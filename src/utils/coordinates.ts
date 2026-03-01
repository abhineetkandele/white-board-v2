import React from "react";

/**
 * Extracts pointer coordinates from a PointerEvent.
 * When `round` is true (default), floors values for pixel-perfect drawing.
 */
export const getPointerCoords = (
  e: PointerEvent | React.PointerEvent<HTMLCanvasElement>,
  round = true,
): { xCord: number; yCord: number } => {
  const xCord = round ? Math.floor(e.clientX) : e.clientX;
  const yCord = round ? Math.floor(e.clientY) : e.clientY;
  return { xCord, yCord };
};

export const hex2rgb = (hex: string): { r: number; g: number; b: number } => {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
};
