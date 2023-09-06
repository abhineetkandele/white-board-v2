const dbName = "white-board";
const storeName = "files";
const storeOptions = {
  keyPath: "fileId",
};

export class IndexDB {
  static idbRequest: IDBOpenDBRequest;
  static idbDatabase: IDBDatabase;

  static openIdbConnection(handleSuccess: (e: Event) => void) {
    if (!indexedDB) {
      console.warn(
        "IndexedDB could not be found in this browser. Data will be lost on page refresh"
      );
      return;
    }

    this.idbRequest = indexedDB.open(dbName, 1);

    this.idbRequest.onerror = (error) => console.warn("Error occured", error);

    this.idbRequest.onupgradeneeded = () => {
      const db = this.idbRequest.result;

      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, storeOptions);
      }
    };

    this.idbRequest.onsuccess = (e) => {
      this.idbDatabase = (e.target as IDBOpenDBRequest).result;
      handleSuccess(e);
    };
  }

  static saveFileToDB(data: object) {
    const tx = this.idbDatabase.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.add(data);
  }

  static getRequest(handleSuccess: (e: Event) => void) {
    this.openIdbConnection(handleSuccess);
    return this.idbRequest;
  }

  static getDatabase() {
    return this.idbDatabase;
  }

  static getData(
    id: string,
    successCb: (result: { dataUrl: string }) => void,
    errorCb: () => void
  ) {
    const indexDB = IndexDB.getDatabase();
    const tx = indexDB.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const data = store.get(id);

    data.onsuccess = () => {
      if (data?.result) {
        successCb(data.result);
      } else {
        errorCb();
      }
    };
  }
}
