import { v4 as uuid } from "uuid";
import type { BoardElement } from "../types";
import { CanvasService } from "./CanvasService";
import { HistoryService } from "./HistoryService";

const STORAGE_KEY = "data";

/**
 * Service for persisting board elements in localStorage.
 */
export class StorageService {
  static getElements(): BoardElement[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BoardElement[]) : [];
  }

  static setElements(data: BoardElement[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    HistoryService.resetAll();
  }

  /**
   * Creates a BoardElement from the current canvas context state
   * and appends it to storage + history.
   */
  static storeElement(
    type: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    path: number[][],
    updateLast = false,
    text = "",
    width = 0,
    height = 0,
    fileId = "",
  ): void {
    const data = this.getElements();
    let existingId = "";

    if (updateLast) {
      const old = data.pop();
      existingId = old?.id ?? "";
    }

    const element = this.createElement(
      type,
      x1,
      y1,
      x2,
      y2,
      [...path],
      text,
      Math.floor(width),
      Math.floor(height),
      fileId,
      existingId,
    );

    HistoryService.pushHistory(element);
    data.push(element);
    this.setElements(data);
  }

  private static createElement(
    type: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    path: number[][],
    text: string,
    width: number,
    height: number,
    fileId: string,
    existingId: string,
  ): BoardElement {
    const ctx = CanvasService.getContext();

    return {
      id: existingId || uuid(),
      type,
      x1,
      y1,
      x2,
      y2,
      dash: ctx.getLineDash(),
      lineWidth: ctx.lineWidth,
      globalAlpha: ctx.globalAlpha,
      strokeStyle: ctx.strokeStyle,
      fillStyle: ctx.fillStyle,
      path,
      text,
      width,
      height,
      fileId,
    };
  }
}
