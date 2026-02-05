const AUTH_CHANNEL_NAME = "auth-sync";
const AUTH_LOGIN_EVENT = "AUTH_LOGIN";
const AUTH_LOGOUT_EVENT = "AUTH_LOGOUT";

type AuthEvent = {
    type: typeof AUTH_LOGIN_EVENT | typeof AUTH_LOGOUT_EVENT;
};

let authChannel: BroadcastChannel | null = null;

function getAuthChannel() {
    if (!authChannel && typeof window !== "undefined" && (window as any).BroadcastChannel) {
        const BC = (window as any).BroadcastChannel;
        authChannel = new BC(AUTH_CHANNEL_NAME);
    }
    return authChannel;
}

export function broadcastAuthLogin() {
    const channel = getAuthChannel();
    if (channel) {
        channel.postMessage({ type: AUTH_LOGIN_EVENT } as AuthEvent);
    } else {
        // Fallback for environments without BroadcastChannel
        try {
            localStorage.setItem("auth-event", "login");
            localStorage.removeItem("auth-event");
        } catch {
            // ignore
        }
    }
}

export function broadcastAuthLogout() {
    const channel = getAuthChannel();
    if (channel) {
        channel.postMessage({ type: AUTH_LOGOUT_EVENT } as AuthEvent);
    } else {
        // Fallback
        try {
            localStorage.setItem("auth-event", "logout");
            localStorage.removeItem("auth-event");
        } catch {
            // ignore
        }
    }
}

export function listenToAuthSync(
    onLogin: () => void,
    onLogout: () => void
) {
    if (typeof window === "undefined") return () => { };

    const channel = getAuthChannel();

    const handleMessage = (event: MessageEvent) => {
        const data = event.data as AuthEvent;
        if (data.type === AUTH_LOGIN_EVENT) {
            onLogin();
        } else if (data.type === AUTH_LOGOUT_EVENT) {
            onLogout();
        }
    };

    const handleStorage = (event: StorageEvent) => {
        if (event.key === "auth-event") {
            if (event.newValue === "login") {
                onLogin();
            } else if (event.newValue === "logout") {
                onLogout();
            }
        }
    };

    if (channel) {
        channel.addEventListener("message", handleMessage);
    }
    window.addEventListener("storage", handleStorage);

    return () => {
        if (channel) {
            channel.removeEventListener("message", handleMessage);
        }
        window.removeEventListener("storage", handleStorage);
    };
}
