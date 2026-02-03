import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "review-sync";
const STORE = "queue";

let db: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!db) {
    db = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, {
            keyPath: "id",
          });
        }
      },
    });
  }

  return db;
}

export async function enqueue(payload: unknown) {
  const db = getDB();
  if (!db) return;

  await (await db).put(STORE, {
    id: crypto.randomUUID(),
    payload,
  });
}

export async function dequeueAll() {
  const db = getDB();
  if (!db) return [];

  return await (await db).getAll(STORE);
}

export async function clearQueue() {
  const db = getDB();
  if (!db) return;

  await (await db).clear(STORE);
}
