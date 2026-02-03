// Security rules/policy layer for API endpoints
import { NextRequest } from "next/server";

export interface APIPolicy {
  maxRequestsPerMinute: number;
  allowedOrigins: string[];
  requireAuth: boolean;
  rateLimitKey?: string;
}

const DEFAULT_POLICY: APIPolicy = {
  maxRequestsPerMinute: 60,
  allowedOrigins: ["*"], // In production, specify actual origins
  requireAuth: false,
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkAPIPolicy(
  request: NextRequest,
  policy: Partial<APIPolicy> = {}
): { allowed: boolean; reason?: string } {
  const finalPolicy = { ...DEFAULT_POLICY, ...policy };

  // Check origin
  if (finalPolicy.allowedOrigins.length > 0 && !finalPolicy.allowedOrigins.includes("*")) {
    const origin = request.headers.get("origin");
    if (origin && !finalPolicy.allowedOrigins.includes(origin)) {
      return { allowed: false, reason: "Origin not allowed" };
    }
  }

  // Check authentication if required
  if (finalPolicy.requireAuth) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return { allowed: false, reason: "Authentication required" };
    }
  }

  // Rate limiting
  const clientId = getClientId(request);
  const now = Date.now();
  const record = rateLimitStore.get(clientId);

  if (record) {
    if (now > record.resetAt) {
      // Reset window
      rateLimitStore.set(clientId, { count: 1, resetAt: now + 60000 });
    } else {
      if (record.count >= finalPolicy.maxRequestsPerMinute) {
        return { allowed: false, reason: "Rate limit exceeded" };
      }
      record.count++;
      rateLimitStore.set(clientId, record);
    }
  } else {
    rateLimitStore.set(clientId, { count: 1, resetAt: now + 60000 });
  }

  return { allowed: true };
}

function getClientId(request: NextRequest): string {
  // Use IP address or API key
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  // Fallback to API key if available
  const apiKey = request.headers.get("x-api-key");
  return apiKey || ip;
}

// Cleanup old rate limit records
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetAt + 60000) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);
