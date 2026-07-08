export const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

export const FETCH_TIMEOUT_MS = 20_000;

export const SHOPIFY_CURRENCY_CODE = 'EUR';

export const BROWSER_OPTIONS = {
  locale: 'de-DE',
  timezoneId: 'Europe/Berlin',
  viewport: { width: 1280, height: 800 },
};

export const PAGE_GOTO_TIMEOUT_MS = 60_000;

export const PAGE_SETTLE_MS = 7_000;

export const RETRY_ATTEMPTS = 3;

export const RETRY_BACKOFF_MS = 15_000;

export const PAUSE_MS = 10_000;

export const PAUSE_AVITO_MS = 45_000;

export const USAGE = 'usage: wish-parser [--only <wish id | host substring>] [--dry-run] [--help]';
