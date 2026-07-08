import { fetchPage } from '../lib/http.js';
import { extractOffers, priceFromOffers } from '../lib/jsonld.js';
import type { Adapter } from '../types.js';

export const tradeinn: Adapter = async (link) => {
  const response = await fetchPage(link);

  if (response.status === 404) return { available: false };
  if (!response.ok) throw new Error(`tradeinn: HTTP ${response.status}`);

  const price = priceFromOffers(extractOffers(await response.text()));

  if (!price) throw new Error('tradeinn: price not found on page');

  return { available: true, ...price };
};
