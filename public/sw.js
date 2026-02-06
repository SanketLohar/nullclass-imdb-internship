// Service Worker for watchlist background sync ONLY (no navigation caching)
const CACHE_NAME = "watchlist-sync-v4";
const SYNC_QUEUE = "watchlist-sync-queue";
const MAX_RETRIES = 5;

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
  self.clients.claim();
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
        // Check retry limit
        if (op.retryCount >= MAX_RETRIES) {
          console.warn(`[SW] Operation ${op.id} exceeded max retries, dropping`, op);
          await removeOperation(db, op.id);
          continue;
        }

        await processOperation(op);
        // Remove from queue on success
        await removeOperation(db, op.id);
      } catch (error) {
        console.error("Failed to sync operation:", op, error);
        // Keep in queue for retry with exponential backoff
        op.retryCount = (op.retryCount || 0) + 1;
        op.lastError = error.message;
        op.nextRetryAt = Date.now() + (Math.pow(2, op.retryCount) * 1000); // Exponential backoff
        await updateOperation(db, op);
      }
    }
  } catch (error) {
    console.error("Sync failed:", error);
    throw error; // Re-throw to trigger retry
  }
}

// Process a single operation with fast-fail offline check
async function processOperation(op) {
  // Fast-fail if offline
  if (!navigator.onLine) {
    throw new Error('Network offline, operation queued');
  }

  const { type, item, itemId, vectorClock, deviceId, payload } = op;

  // Set timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    if (type === "ADD") {
      await fetch("/api/watchlist/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, vectorClock, deviceId }),
        signal: controller.signal,
      }).then(r => { if (!r.ok) throw new Error(r.statusText); });
    }
    else if (type === "REMOVE") {
      await fetch(`/api/watchlist/mock?id=${itemId}`, {
        method: "DELETE",
        headers: { "X-Vector-Clock": JSON.stringify(vectorClock) },
        signal: controller.signal,
      }).then(r => { if (!r.ok) throw new Error(r.statusText); });
    }
    else if (type === "REVIEW_ADD") {
      await fetch("/api/reviews/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: item, deviceId }),
        signal: controller.signal,
      }).then(r => { if (!r.ok) throw new Error(r.statusText); });
    }
    else if (type === "REVIEW_UPDATE") {
      await fetch("/api/reviews/mock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: item, deviceId }),
        signal: controller.signal,
      }).then(r => { if (!r.ok) throw new Error(r.statusText); });
    }
    else if (type === "REVIEW_DELETE") {
      await fetch(`/api/reviews/mock?id=${itemId}`, {
        method: "DELETE",
        signal: controller.signal,
      }).then(r => { if (!r.ok) throw new Error(r.statusText); });
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

// IndexedDB helper functions
async function openSyncQueueDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYNC_QUEUE, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("operations")) {
        db.createObjectStore("operations", { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

async function getPendingOperations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["operations"], "readonly");
    const store = transaction.objectStore("operations");
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

async function removeOperation(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["operations"], "readwrite");
    const store = transaction.objectStore("operations");
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function updateOperation(db, op) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["operations"], "readwrite");
    const store = transaction.objectStore("operations");
    const request = store.put(op);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
