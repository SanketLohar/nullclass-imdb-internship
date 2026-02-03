// Request coalescing cache - dedupe identical API requests
type PendingRequest<T> = {
  promise: Promise<T>;
  timestamp: number;
};

const pendingRequests = new Map<string, PendingRequest<any>>();
const CACHE_TTL = 5000; // 5 seconds

export function coalesceRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const existing = pendingRequests.get(key);

  // Return existing promise if still valid
  if (existing && Date.now() - existing.timestamp < CACHE_TTL) {
    return existing.promise;
  }

  // Create new request
  const promise = fetcher().finally(() => {
    // Clean up after request completes
    setTimeout(() => {
      pendingRequests.delete(key);
    }, CACHE_TTL);
  });

  pendingRequests.set(key, {
    promise,
    timestamp: Date.now(),
  });

  return promise;
}

export function clearCoalesceCache() {
  pendingRequests.clear();
}
