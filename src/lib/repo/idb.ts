// Minimal IndexedDB helper for demo-mode file blobs.
// localStorage can't hold binary data at useful sizes; IndexedDB can.

const DB_NAME = "foundry-files";
const STORE = "blobs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(req.result);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      })
  );
}

export function putBlob(id: string, blob: Blob): Promise<IDBValidKey> {
  return withStore("readwrite", (s) => s.put(blob, id));
}

export function getBlob(id: string): Promise<Blob | undefined> {
  return withStore("readonly", (s) => s.get(id) as IDBRequest<Blob | undefined>);
}

export function deleteBlob(id: string): Promise<undefined> {
  return withStore("readwrite", (s) => s.delete(id) as IDBRequest<undefined>);
}
