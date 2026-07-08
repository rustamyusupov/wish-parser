import { chromium, webkit, type BrowserContext } from 'playwright';

import { BROWSER_OPTIONS, USER_AGENT } from '../constants.js';
import type { Engine } from '../types.js';

const contexts = new Map<Engine, BrowserContext>();

export const getPage = async (engine: Engine) => {
  let context = contexts.get(engine);

  if (!context) {
    const browser = await (engine === 'chromium' ? chromium : webkit).launch({
      args: engine === 'chromium' ? ['--disable-dev-shm-usage', '--no-sandbox'] : [],
    });

    context = await browser.newContext({
      ...BROWSER_OPTIONS,
      ...(engine === 'chromium' ? { userAgent: USER_AGENT } : {}),
    });

    contexts.set(engine, context);
  }

  return context.newPage();
};

export const closeBrowsers = async () => {
  for (const context of contexts.values()) {
    await context.browser()?.close();
  }

  contexts.clear();
};
