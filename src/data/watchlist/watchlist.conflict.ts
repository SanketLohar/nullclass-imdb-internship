// Conflict resolution: vector-clock and last-write-wins
import { WatchlistMovie } from "./watchlist.types";

export interface VectorClock {
  [deviceId: string]: number;
}

export interface WatchlistItemWithClock extends WatchlistMovie {
  vectorClock: VectorClock;
  deviceId: string;
  lastModified: number;
}

export function createVectorClock(deviceId: string): VectorClock {
  return { [deviceId]: 1 };
}

export function incrementClock(
  clock: VectorClock,
  deviceId: string
): VectorClock {
  return {
    ...clock,
    [deviceId]: (clock[deviceId] || 0) + 1,
  };
}

export function mergeClocks(
  clock1: VectorClock,
  clock2: VectorClock
): VectorClock {
  const merged: VectorClock = {};
  const allDevices = new Set([
    ...Object.keys(clock1),
    ...Object.keys(clock2),
  ]);

  for (const device of allDevices) {
    merged[device] = Math.max(clock1[device] || 0, clock2[device] || 0);
  }

  return merged;
}

export function compareClocks(
  clock1: VectorClock,
  clock2: VectorClock
): "before" | "after" | "concurrent" {
  let allBefore = true;
  let allAfter = true;

  const allDevices = new Set([
    ...Object.keys(clock1),
    ...Object.keys(clock2),
  ]);

  for (const device of allDevices) {
    const v1 = clock1[device] || 0;
    const v2 = clock2[device] || 0;

    if (v1 > v2) allAfter = false;
    if (v1 < v2) allBefore = false;
  }

  if (allBefore) return "before";
  if (allAfter) return "after";
  return "concurrent";
}

// Last-write-wins with vector clock tiebreaker
export function resolveConflict(
  item1: WatchlistItemWithClock,
  item2: WatchlistItemWithClock
): WatchlistItemWithClock {
  // If same item, use last-write-wins
  if (item1.id === item2.id) {
    const clockComparison = compareClocks(
      item1.vectorClock,
      item2.vectorClock
    );

    if (clockComparison === "concurrent") {
      // Concurrent edits: use timestamp as tiebreaker
      return item1.lastModified > item2.lastModified ? item1 : item2;
    }

    if (clockComparison === "after") return item1;
    return item2;
  }

  // Different items - shouldn't conflict
  return item1;
}
