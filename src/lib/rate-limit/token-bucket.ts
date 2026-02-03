// Token bucket rate limiter
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  async consume(tokens = 1): Promise<boolean> {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(
      this.capacity,
      this.tokens + tokensToAdd
    );
    this.lastRefill = now;
  }

  getWaitTime(tokens = 1): number {
    this.refill();

    if (this.tokens >= tokens) return 0;

    const tokensNeeded = tokens - this.tokens;
    return Math.ceil((tokensNeeded / this.refillRate) * 1000);
  }
}

// Per-user rate limiters
const userLimiters = new Map<string, TokenBucket>();

export function getUserRateLimiter(userId: string): TokenBucket {
  if (!userLimiters.has(userId)) {
    userLimiters.set(
      userId,
      new TokenBucket(10, 2) // 10 tokens, refill 2 per second
    );
  }
  return userLimiters.get(userId)!;
}
