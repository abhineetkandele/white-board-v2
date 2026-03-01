import { HistoryService, StorageService } from "../services";
import { detectElementAtPoint } from "./geometry";

/**
 * Erases the element under the pointer and triggers a redraw.
 */
export const handleEraser = (
  x: number,
  y: number,
  redraw: () => void,
): void => {
  const index = detectElementAtPoint(x, y);

  if (index === -1) return;

  const data = StorageService.getElements();
  const reversed = [...data].reverse();
  const [deleted] = reversed.splice(index, 1);

  HistoryService.pushHistory(deleted);
  StorageService.setElements(reversed.reverse());
  redraw();
};
