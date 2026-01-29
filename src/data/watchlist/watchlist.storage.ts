import { WatchlistMovie } from "./watchlist.types";

const DB_NAME = "movieverse";
const STORE_NAME = "watchlist";

function getStore(
  mode: IDBTransactionMode
): Promise<IDBObjectStore> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
        });
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

export async function getWatchlist(): Promise<
  WatchlistMovie[]
> {
  const store = await getStore("readonly");

  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () =>
      resolve(req.result as WatchlistMovie[]);
  });
}

export async function addToWatchlist(
  movie: WatchlistMovie
) {
  const store = await getStore("readwrite");
  store.put(movie);
}

export async function removeFromWatchlist(id: string) {
  const store = await getStore("readwrite");
  store.delete(id);
}
