import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "review-drafts";
const STORE = "drafts";

export type ReviewDraft = {
  movieId: number;
  authorName: string;
  rating: number;
  content: string;
  updatedAt: number;
};

let dbPromise: Promise<IDBPDatabase> | null =
  null;

/* ----------------------------------
   SAFE DB INIT (browser only)
----------------------------------- */
function getDB() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (
          !db.objectStoreNames.contains(STORE)
        ) {
          db.createObjectStore(STORE, {
            keyPath: "movieId",
          });
        }
      },
    });
  }

  return dbPromise;
}

/* ----------------------------------
   CRUD
----------------------------------- */

export async function saveDraft(
  draft: ReviewDraft
) {
  const db = getDB();
  if (!db) return;

  await (await db).put(STORE, draft);
}

export async function getDraft(
  movieId: number
): Promise<ReviewDraft | undefined> {
  const db = getDB();
  if (!db) return undefined;

  return (await db).get(STORE, movieId);
}

export async function clearDraft(
  movieId: number
) {
  const db = getDB();
  if (!db) return;

  await (await db).delete(STORE, movieId);
}
