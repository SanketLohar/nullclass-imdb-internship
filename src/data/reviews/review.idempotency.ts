// Idempotency key tracking to prevent double posts
import { nanoid } from "nanoid";

const processedKeys = new Map<string, { timestamp: number; result: any }>();
const KEY_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function generateIdempotencyKey(): string {
  return nanoid();
}

export function isKeyProcessed(key: string): boolean {
  const entry = processedKeys.get(key);
  if (!entry) return false;

  // Check if expired
  if (Date.now() - entry.timestamp > KEY_TTL) {
    processedKeys.delete(key);
    return false;
  }

  return true;
}

export function getProcessedResult(key: string): any {
  return processedKeys.get(key)?.result;
}

export function markKeyProcessed(key: string, result: any): void {
  processedKeys.set(key, {
    timestamp: Date.now(),
    result,
  });

  // Cleanup old keys periodically
  if (processedKeys.size > 1000) {
    const now = Date.now();
    for (const [k, v] of processedKeys.entries()) {
      if (now - v.timestamp > KEY_TTL) {
        processedKeys.delete(k);
      }
    }
  }
}
