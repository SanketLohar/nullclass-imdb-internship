// Circuit breaker pattern for graceful degradation
type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    if (this.state === "open") {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.options.resetTimeout) {
        this.state = "half-open";
        this.successCount = 0;
      } else {
        // Circuit is open, return fallback
        if (fallback) return fallback();
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;

    if (this.state === "half-open") {
      this.successCount++;
      if (this.successCount >= 2) {
        this.state = "closed";
      }
    }
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.failureThreshold) {
      this.state = "open";
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

export function createCircuitBreaker(options?: Partial<CircuitBreakerOptions>) {
  return new CircuitBreaker({
    failureThreshold: options?.failureThreshold ?? 5,
    resetTimeout: options?.resetTimeout ?? 60000, // 1 minute
    monitoringPeriod: options?.monitoringPeriod ?? 60000,
  });
}
