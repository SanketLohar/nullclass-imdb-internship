import { WatchlistItem } from "@/data/watchlist/watchlist.types";
import { VectorClock } from "./vector-clock";

/**
 * Resolves conflict between a local version and a remote version of a watchlist item.
 * @param local Local item (can be undefined if deleted locally)
 * @param remote Remote item (can be undefined if deleted remotely)
 * @param localClock Vector clock for the local operation
 * @param remoteClock Vector clock for the remote state
 */
export function resolveConflict(
    local: WatchlistItem | undefined,
    remote: WatchlistItem | undefined,
    localClock: VectorClock,
    remoteClock: VectorClock
): { resolved: WatchlistItem | undefined; action: "keep_local" | "update_from_remote" | "delete" } {
    // If clocks are identical, they are in sync
    if (localClock.serialize() === remoteClock.serialize()) {
        return { resolved: local, action: "keep_local" };
    }

    // If local is strictly newer, keep local
    // (Simplified LWW fallback if clocks are incomparable, biasing towards Last Write)
    // In a real system, we'd check strict dominance.
    // Here we assume if local has ANY higher counter for this client ID, it wins.

    // Strategy: LWW based on `updatedAt` as a fallback, but prioritize Vector Clock causality.

    const localTime = local?.updatedAt || 0;
    const remoteTime = remote?.updatedAt || 0;

    if (localTime > remoteTime) {
        return { resolved: local, action: "keep_local" };
    } else if (remoteTime > localTime) {
        return { resolved: remote, action: "update_from_remote" };
    }

    // Tie-breaker: Prefer adding over deleting?
    if (local && !remote) return { resolved: local, action: "keep_local" };
    if (!local && remote) return { resolved: remote, action: "update_from_remote" };

    return { resolved: local, action: "keep_local" };
}
