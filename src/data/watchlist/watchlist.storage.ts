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

import { createVectorClock, incrementClock } from "./watchlist.conflict";
import { queueOperationForSync } from "../../lib/watchlist/service-worker";

function getDeviceId() {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

export async function addToWatchlist(movie: WatchlistMovie) {
  const store = await getStore("readwrite");
  const deviceId = getDeviceId();

  // Initialize sync fields
  const now = Date.now();
  const vectorClock = movie.vectorClock
    ? incrementClock(movie.vectorClock, deviceId)
    : createVectorClock(deviceId);

  const movieWithSync: WatchlistMovie = {
    ...movie,
    vectorClock,
    deviceId,
    updatedAt: now,
  };

  await new Promise<void>((resolve, reject) => {
    const req = store.put(movieWithSync);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  // Queue for sync
  await queueOperationForSync({
    type: "ADD",
    item: movieWithSync,
    vectorClock,
    deviceId,
    timestamp: now
  });
}

/* ---------------------------------------
   REMOVE
---------------------------------------- */

export async function removeFromWatchlist(userId: string, movieId: string) {
  // 1. Get the item first to preserve its vector clock for the tombstone/sync
  const invalidOrMissing = { [getDeviceId()]: 1 };
  let vectorClock = invalidOrMissing;
  try {
    const items = await getWatchlist(userId); // inefficient but reuses existing read
    const item = items.find(i => i.id === movieId);
    if (item && item.vectorClock) {
      vectorClock = incrementClock(item.vectorClock, getDeviceId());
    }
  } catch (e) { }

  const store = await getStore("readwrite");

  await new Promise<void>((resolve, reject) => {
    const req = store.delete([userId, movieId]);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  await queueOperationForSync({
    type: "REMOVE",
    itemId: movieId,
    vectorClock,
    deviceId: getDeviceId()
  });
}
