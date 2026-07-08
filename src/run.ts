import { setTimeout as sleep } from 'node:timers/promises';

import { adapterFor } from './adapters/index.js';
import { PAUSE_AVITO_MS, PAUSE_MS, RETRY_ATTEMPTS, RETRY_BACKOFF_MS } from './constants.js';
import { openDb } from './db.js';
import { closeBrowsers } from './lib/browser.js';
import { withRetry } from './lib/retry.js';
import type { Outcome, WishRow } from './types.js';

const logWish = ({ id, name }: WishRow, message: string) =>
  console.log(`[${id}] ${name}: ${message}`);

const failWish = ({ id, name }: WishRow, reason: string): Outcome => {
  console.error(`[${id}] ${name}: ${reason}`);
  return 'failed';
};

const pauseFor = ({ link }: WishRow) => (link.includes('avito.ru') ? PAUSE_AVITO_MS : PAUSE_MS);

const processWish = async (db: ReturnType<typeof openDb>, wish: WishRow): Promise<Outcome> => {
  const adapter = adapterFor(wish.link);

  if (!adapter) return failWish(wish, `no adapter for ${new URL(wish.link).hostname}`);

  try {
    const result = await withRetry(() => adapter(wish.link), RETRY_ATTEMPTS, RETRY_BACKOFF_MS);

    if (!result.available) {
      logWish(wish, 'unavailable');
      return 'unavailable';
    }

    db.insertPrice(wish.id, result.amount, result.currencyCode);
    logWish(wish, `${result.amount} ${result.currencyCode}`);

    return 'saved';
  } catch (error) {
    return failWish(wish, error instanceof Error ? error.message : String(error));
  }
};

const summarize = (outcomes: Outcome[]) => {
  const count = (outcome: Outcome) => outcomes.filter((item) => item === outcome).length;

  const stats = {
    saved: count('saved'),
    unavailable: count('unavailable'),
    failed: count('failed'),
  };

  console.log(
    `run finished: ${stats.saved} saved, ${stats.unavailable} unavailable, ${stats.failed} failed`,
  );

  return stats;
};

export const run = async (dbPath: string) => {
  const db = openDb(dbPath);

  try {
    const wishes = db.selectWishes();

    console.log(`run started: ${wishes.length} wishes`);

    const outcomes: Outcome[] = [];

    for (const [index, wish] of wishes.entries()) {
      outcomes.push(await processWish(db, wish));

      if (index < wishes.length - 1) await sleep(pauseFor(wish));
    }

    return summarize(outcomes);
  } finally {
    await closeBrowsers();
    db.close();
  }
};
