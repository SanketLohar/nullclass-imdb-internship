"use client";

import { useEffect, useState, useRef } from "react";
// Since true IndexedDB requires async setup, we'll use LocalStorage for simplicity 
// as permitted by "LocalStorage + IndexedDB" requirement (often treated as storage layer).
// But for "Review System - Implement autosave drafts using IndexedDB" specifically in prompt,
// I will start with LocalStorage but wrap it to look like async save for potential IDB switch.

// Actually, let's use a simple IDB key-val wrapper for robustness if strict compliance is needed.
// 'idb-keyval' is common, but I don't want to install deps.
// I'll stick to LocalStorage for "Autosave drafts" unless strictly IndexedDB is forced.
// The prompt says "Implement autosave drafts using IndexedDB".
// I will use a tiny IDB helper.

const DB_NAME = "reviews-autosave-db";
const STORE_NAME = "drafts";

function openDB() {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function useAutosave<T>(key: string, value: T, delay = 1000) {
    const [savedValue, setSavedValue] = useState<T | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>(null);

    // Sync across tabs
    useEffect(() => {
        if (typeof window === "undefined") return;

        let cleanup: (() => void) | undefined;
        let active = true;

        import("@/lib/client/broadcast").then(({ createReader }) => {
            if (!active) return;

            cleanup = createReader("reviews-draft-sync", (data: any) => {
                if (data?.key === key && data?.value !== undefined) {
                    // Only update if value is different to avoid redundant renders or loops
                    setSavedValue((prev) => {
                        if (JSON.stringify(prev) !== JSON.stringify(data.value)) {
                            return data.value;
                        }
                        return prev;
                    });
                }
            });
        }).catch(err => console.error("Failed to load broadcast module", err));

        return () => {
            active = false;
            if (cleanup) cleanup();
        };
    }, [key]);

    // Restore on mount
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const db = await openDB();
                const tx = db.transaction(STORE_NAME, "readonly");
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(key);
                req.onsuccess = () => {
                    if (mounted && req.result !== undefined) {
                        setSavedValue(req.result);
                    }
                };
            } catch (e) {
                console.error("Autosave restore failed", e);
            }
        })();
        return () => { mounted = false; };
    }, [key]);

    // Save on change with debounce
    useEffect(() => {
        if (value === savedValue || value === null) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsSaving(true);

        timeoutRef.current = setTimeout(async () => {
            try {
                const db = await openDB();
                const tx = db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                store.put(value, key);

                // Broadcast change safely via dynamic import
                if (typeof window !== "undefined") {
                    import("@/lib/client/broadcast").then(({ broadcast }) => {
                        broadcast("reviews-draft-sync", { key, value });
                    }).catch(e => console.error("Broadcast failed", e));
                }

                setSavedValue(value);
            } catch (e) {
                console.error("Autosave failed", e);
            } finally {
                setIsSaving(false);
            }
        }, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [key, value, delay, savedValue]);

    const clear = async () => {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.delete(key);

            // Broadcast clear safely via dynamic import
            if (typeof window !== "undefined") {
                import("@/lib/client/broadcast").then(({ broadcast }) => {
                    broadcast("reviews-draft-sync", { key, value: "" }); // or null, depending on usage. Content usually string.
                }).catch(e => console.error("Broadcast clear failed", e));
            }

            setSavedValue(null); // or match initial
        } catch (e) {
            console.error("Autosave clear failed", e);
        }
    };

    return { isSaving, savedValue, clear };
}
