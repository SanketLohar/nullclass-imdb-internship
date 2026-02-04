import { WatchlistMovie } from "./watchlist.types";

const CHANNEL_NAME = "watchlist_sync";

export function getDeviceId() {
    if (typeof window === "undefined") return "server";
    let id = localStorage.getItem("device_id");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("device_id", id);
    }
    return id;
}

export function initWatchlistSync(
    onMessage: (msg: { type: string; item?: any; itemId?: string; items?: any[] }) => void
) {
    if (typeof window === "undefined") return () => { };

    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (event) => {
        onMessage(event.data);
    };

    return () => channel.close();
}

export function broadcastAdd(movie: WatchlistMovie) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: "ADD", item: movie });
    channel.close();
}

export function broadcastRemove(itemId: string, vectorClock: any) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: "REMOVE", itemId, vectorClock });
    channel.close();
}
