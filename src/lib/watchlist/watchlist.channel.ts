// IMPORTANT: This file must NEVER be imported statically by Edge code

export function createWatchlistChannel(
    name: string,
    onMessage: () => void
) {
    if (typeof window === "undefined") return null;

    const BC = (window as any)["BroadcastChannel"];
    if (!BC) return null;

    const channel = new BC(name);
    channel.onmessage = onMessage;

    return channel;
}
