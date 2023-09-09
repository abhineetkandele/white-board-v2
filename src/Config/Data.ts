import { BoardElement } from "../types/types";

export class Data {
  private static cache = new Map();
  private static history: BoardElement[] = [];
  private static redoRecords: BoardElement[] = [];

  static checkCache(key: string) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    return false;
  }

  static setCache(key: string, data: HTMLImageElement) {
    this.cache.set(key, data);
  }

  static clearCache() {
    this.cache.clear();
  }

  static addHistoryItem(obj: BoardElement) {
    this.history.push(obj);
  }

  static deleteHistoryItem() {
    const item = this.history.pop();

    if (item) {
      this.addRedoItem(item);
    }
    return item;
  }

  static clearHistory() {
    this.history.length = 0;
  }

  static addRedoItem(obj: BoardElement) {
    this.redoRecords.push(obj);
  }

  static deleteRedoItem() {
    const item = this.redoRecords.pop();

    if (item) {
      this.addHistoryItem(item);
    }
    return item;
  }

  static clearRedos() {
    this.redoRecords.length = 0;
  }

  static resetData() {
    this.clearCache();
    this.clearHistory();
    this.clearRedos();
  }
}
