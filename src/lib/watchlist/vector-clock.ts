/**
 * Simple Vector Clock implementation for conflict detection
 */
export class VectorClock {
    public timestamps: Record<string, number>;

    constructor(timestamps?: Record<string, number>) {
        this.timestamps = { ...timestamps };
    }

    increment(nodeId: string) {
        this.timestamps[nodeId] = (this.timestamps[nodeId] || 0) + 1;
    }

    merge(other: VectorClock) {
        const newTimestamps = { ...this.timestamps };
        for (const [node, time] of Object.entries(other.timestamps)) {
            newTimestamps[node] = Math.max(newTimestamps[node] || 0, time);
        }
        this.timestamps = newTimestamps;
    }

    // Returns true if this clock is "after" or "concurrent" with the other (basically if we have new info)
    // Simplified for this use case: just checks if we have any greater timestamp
    isNewerOrConcurrent(other: VectorClock): boolean {
        for (const [node, time] of Object.entries(this.timestamps)) {
            if (time > (other.timestamps[node] || 0)) return true;
        }
        // Also check if they have nodes we don't?
        // For single-user sync, we usually care if *our* mutation is newer than *server* state.
        return false;
    }

    serialize(): string {
        return JSON.stringify(this.timestamps);
    }

    static deserialize(json: string): VectorClock {
        try {
            return new VectorClock(JSON.parse(json));
        } catch {
            return new VectorClock({});
        }
    }
}
