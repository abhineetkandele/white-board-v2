import type { BoardElement } from "../types";

/**
 * In-memory history stack for undo/redo operations,
 * plus an image cache for redrawing.
 */
export class HistoryService {
  private static cache = new Map<string, HTMLImageElement>();
  private static history: BoardElement[] = [];
  private static redoStack: BoardElement[] = [];

  // --- Image cache ---

  static getCachedImage(key: string): HTMLImageElement | null {
    return this.cache.get(key) ?? null;
  }

  static setCachedImage(key: string, img: HTMLImageElement): void {
    this.cache.set(key, img);
  }

  // --- Undo history ---

  static pushHistory(item: BoardElement): void {
    this.history.push(item);
  }

  static popHistory(): BoardElement | undefined {
    const item = this.history.pop();
    if (item) this.redoStack.push(item);
    return item;
  }

  // --- Redo stack ---

  static popRedo(): BoardElement | undefined {
    const item = this.redoStack.pop();
    if (item) this.history.push(item);
    return item;
  }

  // --- Reset ---

  static resetAll(): void {
    this.cache.clear();
    this.history.length = 0;
    this.redoStack.length = 0;
  }
}
