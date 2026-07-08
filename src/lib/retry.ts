import { setTimeout as sleep } from 'node:timers/promises';

export const withRetry = async <T>(
  fn: () => Promise<T>,
  attempts: number,
  backoffMs: number,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) await sleep(backoffMs * attempt);
    }
  }

  throw lastError;
};
