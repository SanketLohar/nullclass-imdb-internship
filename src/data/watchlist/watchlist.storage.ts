import { WatchlistMovie } from "./watchlist.types";

const DB_NAME = "movieverse";
const STORE_NAME = "watchlist";

function getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: ["userId", "id"], // ✅ COMPOSITE KEY
        });
        store.createIndex("userId", "userId", { unique: false });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, mode);
      resolve(tx.objectStore(STORE_NAME));
    };

    request.onerror = () => reject(request.error);
  });
}

/* ---------------------------------------
   READ
---------------------------------------- */

export async function getWatchlist(userId: string): Promise<WatchlistMovie[]> {
  const store = await getStore("readonly");
  const index = store.index("userId");

  return new Promise((resolve) => {
    const req = index.getAll(userId);
    req.onsuccess = () => resolve(req.result as WatchlistMovie[]);
    req.onerror = () => resolve([]);
  });
}

/* ---------------------------------------
   ADD
---------------------------------------- */

export async function addToWatchlist(movie: WatchlistMovie) {
  const store = await getStore("readwrite");

  return new Promise<void>((resolve, reject) => {
    const req = store.put(movie); // ✅ ID UNTOUCHED
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/* ---------------------------------------
   REMOVE
---------------------------------------- */

export async function removeFromWatchlist(userId: string, movieId: string) {
  const store = await getStore("readwrite");

  return new Promise<void>((resolve, reject) => {
    const req = store.delete([userId, movieId]); // ✅ COMPOSITE KEY
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
