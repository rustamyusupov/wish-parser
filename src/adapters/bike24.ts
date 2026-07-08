import { PAGE_GOTO_TIMEOUT_MS, PAGE_SETTLE_MS } from '../constants.js';
import { getPage } from '../lib/browser.js';
import { extractOffers, priceFromOffers } from '../lib/jsonld.js';
import type { Adapter } from '../types.js';

const PRICE_RE = /(\d[\d.]*,\d{2})\s*€/;

export const bike24: Adapter = async (link) => {
  const page = await getPage('webkit');

  try {
    const response = await page.goto(link, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_GOTO_TIMEOUT_MS,
    });

    if (response?.status() === 404) return { available: false };
    if (response && response.status() >= 400) throw new Error(`bike24: HTTP ${response.status()}`);

    await page.waitForTimeout(PAGE_SETTLE_MS);

    const { pathname } = new URL(link);
    const offers = extractOffers(await page.content()).filter(({ url }) => url?.includes(pathname));
    const price = priceFromOffers(offers);

    if (price) return { available: true, ...price };

    const text = await page.locator('.price__value').first().innerText();
    const match = PRICE_RE.exec(text);

    if (match?.[1]) {
      return {
        available: true,
        amount: Number(match[1].replaceAll('.', '').replace(',', '.')),
        currencyCode: 'EUR',
      };
    }

    throw new Error('bike24: price not found on page');
  } finally {
    await page.close();
  }
};
