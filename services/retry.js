// Simple exponential backoff retry helper
export async function retryRequest(fn, attempts = 3, initialDelay = 500) {
  let lastErr;
  let delay = initialDelay;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // If it's a 4xx error other than 429, don't retry
      const status = err?.response?.status;
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw err;
      }
      // wait before retrying
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
  throw lastErr;
}
