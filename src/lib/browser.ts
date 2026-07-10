import { webkit, type BrowserContext } from 'playwright';

const BROWSER_OPTIONS = {
  locale: 'de-DE',
  timezoneId: 'Europe/Berlin',
  viewport: { width: 1280, height: 800 },
};

let context: BrowserContext | undefined;

export const getPage = async () => {
  if (!context) {
    const browser = await webkit.launch();
    context = await browser.newContext(BROWSER_OPTIONS);
  }

  return context.newPage();
};

export const closeBrowser = async () => {
  await context?.browser()?.close();
  context = undefined;
};
