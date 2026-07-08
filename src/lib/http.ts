import { USER_AGENT } from '#constants';

const FETCH_TIMEOUT_MS = 20_000;

export const fetchPage = (url: string) =>
  fetch(url, {
    headers: {
      'user-agent': USER_AGENT,
      accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
