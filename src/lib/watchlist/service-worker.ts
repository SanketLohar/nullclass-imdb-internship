import { WatchlistMovie } from "@/data/watchlist/watchlist.types";
import { VectorClock } from "@/data/watchlist/watchlist.conflict";
import { Review } from "@/data/reviews/review.types";

export interface SyncOperation {
  type: "ADD" | "REMOVE" | "REVIEW_ADD" | "REVIEW_UPDATE" | "REVIEW_DELETE" | "REVIEW_VOTE";
  item?: WatchlistMovie | Review;
  itemId?: string;
  vectorClock?: VectorClock;
  deviceId?: string;
  timestamp?: number;
  retryCount?: number;
  // Extra fields for review logic
  payload?: any;
}

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Listen for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New service worker available
            console.log("New service worker available");
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}

// Request background sync
export async function requestBackgroundSync() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if Background Sync API is available
    if ("sync" in registration) {
      await (registration as any).sync.register("watchlist-sync");
      return true;
    }

    // Fallback: send message to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SYNC_WATCHLIST",
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Background sync request failed:", error);
    return false;
  }
}

// Queue operation for background sync
export async function queueOperationForSync(operation: SyncOperation) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const db = await openSyncQueueDB();
    await addOperationToQueue(db, {
      ...operation,
      timestamp: Date.now(),
      retryCount: 0,
    });

    // Request background sync
    await requestBackgroundSync();
  } catch (error) {
    console.error("Failed to queue operation:", error);
  }
}

function openSyncQueueDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("watchlist-sync-queue", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
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

function addOperationToQueue(
  db: IDBDatabase,
  operation: SyncOperation
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("operations", "readwrite");
    const store = tx.objectStore("operations");
    const request = store.add(operation);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
