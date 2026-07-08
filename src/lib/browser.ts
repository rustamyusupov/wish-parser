import { chromium, webkit, type BrowserContext } from 'playwright';

import { USER_AGENT } from '#constants';

type Engine = 'chromium' | 'webkit';

const BROWSER_OPTIONS = {
  locale: 'de-DE',
  timezoneId: 'Europe/Berlin',
  viewport: { width: 1280, height: 800 },
};

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
