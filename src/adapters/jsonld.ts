import { PAGE_GOTO_TIMEOUT_MS, PAGE_SETTLE_MS } from '#constants';
import { getPage } from '#lib/browser';
import { fetchPage } from '#lib/http';
import { extractOffers, nameFromLd, priceFromOffers } from '#lib/jsonld';
import type { Adapter } from '#types';

const NOT_FOUND = Symbol('not found');

const fetchHtml = async (link: string, hostname: string) => {
  const response = await fetchPage(link);

  if (response.status === 404) return NOT_FOUND;
  if (!response.ok) throw new Error(`${hostname}: HTTP ${response.status}`);

  return response.text();
};

const renderHtml = async (link: string, hostname: string) => {
  const page = await getPage();

  try {
    const response = await page.goto(link, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_GOTO_TIMEOUT_MS,
    });

    if (response?.status() === 404) return NOT_FOUND;
    if (response && response.status() >= 400) {
      throw new Error(`${hostname}: HTTP ${response.status()} in browser`);
    }

    await page.waitForTimeout(PAGE_SETTLE_MS);

    return await page.content();
  } finally {
    await page.close();
  }
};

export const jsonld: Adapter = async (link) => {
  const { hostname } = new URL(link);
  // anti-bot may reject the plain fetch (403/timeout); the browser passes its JS challenge
  const html = await fetchHtml(link, hostname).catch(() => renderHtml(link, hostname));

  if (html === NOT_FOUND) return { available: false };

  const offers = extractOffers(html);

  if (
    offers.length > 0 &&
    offers.every(({ availability }) => availability?.includes('OutOfStock'))
  ) {
    return { available: false };
  }

  const price = priceFromOffers(offers);

  if (!price) throw new Error(`${hostname}: price not found on page`);

  return { available: true, ...price, name: nameFromLd(html) };
};
