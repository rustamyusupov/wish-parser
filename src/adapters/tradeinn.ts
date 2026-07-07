import { fetchPage } from '../lib/http.js';
import type { Adapter, LdOffer } from '../types.js';

const LD_JSON_RE = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs;

// offers can sit at any depth (e.g. WebPage → mainEntity → ProductGroup → hasVariant)
const findOffers = (node: unknown): LdOffer[] => {
  if (Array.isArray(node)) return node.flatMap(findOffers);
  if (!node || typeof node !== 'object') return [];
  const { offers } = node as { offers?: LdOffer | LdOffer[] };
  if (offers) return [offers].flat();
  return Object.values(node).flatMap(findOffers);
};

export const tradeinn: Adapter = async (link) => {
  const response = await fetchPage(link);
  if (response.status === 404) return { available: false };
  if (!response.ok) throw new Error(`tradeinn: HTTP ${response.status}`);

  const html = await response.text();
  for (const match of html.matchAll(LD_JSON_RE)) {
    if (!match[1]) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(match[1]);
    } catch {
      continue;
    }
    const offers = findOffers(parsed);
    const prices = offers
      .map(({ lowPrice, price }) => Number(lowPrice ?? price))
      .filter(Number.isFinite);
    const currencyCode = offers.find(({ priceCurrency }) => priceCurrency)?.priceCurrency;
    if (prices.length > 0 && currencyCode) {
      return { available: true, amount: Math.min(...prices), currencyCode };
    }
  }
  throw new Error('tradeinn: price not found on page');
};
