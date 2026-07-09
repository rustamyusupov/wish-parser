import { fetchPage } from '#lib/http';
import { extractOffers, nameFromLd, priceFromOffers } from '#lib/jsonld';
import type { Adapter } from '#types';

export const tradeinn: Adapter = async (link) => {
  const response = await fetchPage(link);

  if (response.status === 404) return { available: false };
  if (!response.ok) throw new Error(`tradeinn: HTTP ${response.status}`);

  const html = await response.text();
  const price = priceFromOffers(extractOffers(html));

  if (!price) throw new Error('tradeinn: price not found on page');

  return { available: true, ...price, name: nameFromLd(html) };
};
