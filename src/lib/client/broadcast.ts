export function createReader(name: string, callback: (data: any) => void): () => void {
    if (typeof BroadcastChannel === 'undefined') return () => { };
    const bc = new BroadcastChannel(name);
    bc.onmessage = (e) => callback(e.data);
    return () => bc.close();
}

export function broadcast(name: string, payload: any) {
    if (typeof BroadcastChannel === 'undefined') return;
    const bc = new BroadcastChannel(name);
    bc.postMessage(payload);
    bc.close();
}
