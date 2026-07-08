import { PAGE_GOTO_TIMEOUT_MS, PAGE_SETTLE_MS } from '../constants.js';
import { getPage } from '../lib/browser.js';
import type { Adapter } from '../types.js';

const PRICE_RE = /\d[\d\s]{0,12}₽/;
const UNAVAILABLE_RE = /нет в наличии|товар (недоступен|закончился|не найден)/i;

export const aliexpress: Adapter = async (link) => {
  const page = await getPage('chromium');
  try {
    const response = await page.goto(link, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_GOTO_TIMEOUT_MS,
    });
    if (response?.status() === 404) return { available: false };
    if (response && response.status() >= 400) {
      throw new Error(`aliexpress: HTTP ${response.status()}`);
    }
    await page.waitForTimeout(PAGE_SETTLE_MS);

    const text = await page.locator('body').innerText();
    const match = PRICE_RE.exec(text);
    if (match) {
      return { available: true, amount: Number(match[0].replace(/\D/g, '')), currencyCode: 'RUB' };
    }
    if (UNAVAILABLE_RE.test(text)) return { available: false };
    throw new Error('aliexpress: price not found on page');
  } finally {
    await page.close();
  }
};
