import { webkit, type BrowserContext } from 'playwright';

const BROWSER_OPTIONS = {
  locale: 'de-DE',
  timezoneId: 'Europe/Berlin',
  viewport: { width: 1280, height: 800 },
};

let context: BrowserContext | undefined;

const createContext = async () => {
  const browser = await webkit.launch();

  return browser.newContext(BROWSER_OPTIONS);
};

export const getPage = async () => {
  context ??= await createContext();

  try {
    return await context.newPage();
  } catch {
    await closeBrowser();
    context = await createContext();

    return context.newPage();
  }
};

export const closeBrowser = async () => {
  await context?.browser()?.close();
  context = undefined;
};
