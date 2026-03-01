const DB_NAME = "white-board";
const STORE_NAME = "files";
const STORE_OPTIONS: IDBObjectStoreParameters = { keyPath: "fileId" };

/**
 * Service for storing and retrieving image files via IndexedDB.
 */
export class IndexedDBService {
  private static request: IDBOpenDBRequest;
  private static database: IDBDatabase;

  static open(onReady: (e: Event) => void): IDBOpenDBRequest {
    if (!indexedDB) {
      console.warn(
        "IndexedDB not available. Image data will be lost on page refresh.",
      );
    }

    this.request = indexedDB.open(DB_NAME, 1);

    this.request.onerror = (err) =>
      console.warn("IndexedDB open error:", err);

    this.request.onupgradeneeded = () => {
      const db = this.request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, STORE_OPTIONS);
      }
    };

    this.request.onsuccess = (e) => {
      this.database = (e.target as IDBOpenDBRequest).result;
      onReady(e);
    };

    return this.request;
  }

  static getDatabase(): IDBDatabase {
    return this.database;
  }

  static saveFile(data: { dataUrl: string; fileId: string }): void {
    const tx = this.database.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(data);
  }

  static getFile(
    fileId: string,
    onSuccess: (result: { dataUrl: string }) => void,
    onError: () => void,
  ): void {
    const tx = this.database.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(fileId);

    request.onsuccess = () => {
      if (request.result) {
        onSuccess(request.result);
      } else {
        onError();
      }
    };
  }
}
