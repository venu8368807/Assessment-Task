class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<() => Promise<any>> = [];
  private maxConcurrency: number;

  constructor(maxConcurrency: number) {
    this.maxConcurrency = maxConcurrency;
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.maxConcurrency) {
      await new Promise<void>((resolve) => {
        this.queue.push(async () => {
          try {
            return await fn();
          } finally {
            resolve();
          }
        });
      });
    }

    this.running++;
    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) {
          next();
        }
      }
    }
  }
}

export const limit = new ConcurrencyLimiter(5);

export function calculateBackoffDelay(
  attempt: number,
  baseDelay: number = 250,
  maxDelay: number = 5000
): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 0.1 * delay;
  return delay + jitter;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 250
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts - 1) {
        throw lastError;
      }
      const delay = calculateBackoffDelay(attempt, baseDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

export async function rateLimitedRequest<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  return limit.run(() => retryWithBackoff(fn, maxAttempts));
}

export async function respectfulDelay(
  minDelay: number = 200,
  maxDelay: number = 400
): Promise<void> {
  const delay = Math.random() * (maxDelay - minDelay) + minDelay;
  await new Promise(resolve => setTimeout(resolve, delay));
}
