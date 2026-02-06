import { Actor } from "../actors.types";

/**
 * Simulates Firestore Security Rules / Policy Layer
 * 
 * Rules:
 * 1. connection.ip must be valid (simulated)
 * 2. resource.data.visibility must be 'public'
 * 3. request.auth needed for sensitive fields (not applicable here, but modeled)
 */

interface PolicyContext {
    userId?: string;
    ip?: string;
}

export class ActorPolicy {
    private context: PolicyContext;

    constructor(context: PolicyContext = { ip: "127.0.0.1" }) {
        this.context = context;
    }

    canRead(actor: Actor): boolean {
        // Simulation: Ensure actor is "published" (we assume all TMDB actors are public)
        // In a real Firestore rule: allow read: if resource.data.status == 'public';
        if (!actor) return false;

        // Simulate IP ban check
        if (this.context.ip === "0.0.0.0") {
            console.warn("[ActorPolicy] Access Denied: Blocked IP");
            return false;
        }

        return true;
    }

    // Filter fields based on policy (projection)
    applyProjection(actor: Actor): Partial<Actor> {
        // If we had internal fields like 'contactInfo', we would strip them here
        // for unauthenticated users.
        // For now, return full object as purely public data.
        return actor;
    }
}

export function withActorPolicy(actor: Actor | null, context?: PolicyContext): Actor | null {
    if (!actor) return null;

    const policy = new ActorPolicy(context);
    if (!policy.canRead(actor)) {
        return null;
    }

    return actor;
}
