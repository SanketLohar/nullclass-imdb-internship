// Service Worker for watchlist background sync
const CACHE_NAME = "watchlist-sync-v1";
const SYNC_QUEUE = "watchlist-sync-queue";

// Install event - cache resources
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Background sync event
self.addEventListener("sync", (event) => {
  if (event.tag === "watchlist-sync") {
    event.waitUntil(syncWatchlist());
  }
});

// Message handler for manual sync requests
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SYNC_WATCHLIST") {
    event.waitUntil(syncWatchlist());
  }
});

// Sync watchlist with server
async function syncWatchlist() {
  try {
    // Get pending operations from IndexedDB
    const db = await openSyncQueueDB();
    const pendingOps = await getPendingOperations(db);

    if (pendingOps.length === 0) {
      return;
    }

    // Process each operation
    for (const op of pendingOps) {
      try {
        await processOperation(op);
        // Remove from queue on success
        await removeOperation(db, op.id);
      } catch (error) {
        console.error("Failed to sync operation:", op, error);
        // Keep in queue for retry
        op.retryCount = (op.retryCount || 0) + 1;
        op.lastError = error.message;
        await updateOperation(db, op);
      }
    }
  } catch (error) {
    console.error("Sync failed:", error);
    throw error; // Re-throw to trigger retry
  }
}

// Process a single operation
async function processOperation(op) {
  const { type, item, itemId, vectorClock, deviceId } = op;

  if (type === "ADD") {
    const response = await fetch("/api/watchlist/mock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, vectorClock, deviceId }),
    });

    if (!response.ok) {
      throw new Error(`Add failed: ${response.statusText}`);
    }
  } else if (type === "REMOVE") {
    const response = await fetch(`/api/watchlist/mock?id=${itemId}`, {
      method: "DELETE",
      headers: { "X-Vector-Clock": JSON.stringify(vectorClock) },
    });

    if (!response.ok) {
      throw new Error(`Remove failed: ${response.statusText}`);
    }
  }
}

// IndexedDB for sync queue
function openSyncQueueDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("watchlist-sync-queue", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("operations")) {
        const store = db.createObjectStore("operations", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getPendingOperations(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("operations", "readonly");
    const store = tx.objectStore("operations");
    const index = store.index("timestamp");
    const request = index.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function removeOperation(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("operations", "readwrite");
    const store = tx.objectStore("operations");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function updateOperation(db, op) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("operations", "readwrite");
    const store = tx.objectStore("operations");
    const request = store.put(op);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
