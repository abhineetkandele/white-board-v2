export class Cache {
  static cache = new Map();

  static checkCache(key: string) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    return false;
  }

  static setCache(key: string, data: HTMLImageElement) {
    this.cache.set(key, data);
  }
}
