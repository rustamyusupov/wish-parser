import type { LdOffer } from '../types.js';

const LD_JSON_RE = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs;

const findOffers = (node: unknown): LdOffer[] => {
  if (Array.isArray(node)) return node.flatMap(findOffers);
  if (!node || typeof node !== 'object') return [];

  const { offers } = node as { offers?: LdOffer | LdOffer[] };

  if (offers) return [offers].flat();

  return Object.values(node).flatMap(findOffers);
};

export const extractOffers = (html: string): LdOffer[] => {
  const offers: LdOffer[] = [];

  for (const match of html.matchAll(LD_JSON_RE)) {
    if (!match[1]) continue;

    try {
      offers.push(...findOffers(JSON.parse(match[1])));
    } catch {
      /* empty */
    }
  }

  return offers;
};

export const priceFromOffers = (offers: LdOffer[]) => {
  const amounts = offers
    .map(({ lowPrice, price }) => Number(lowPrice ?? price))
    .filter(Number.isFinite);
  const currencyCode = offers.find(({ priceCurrency }) => priceCurrency)?.priceCurrency;

  if (amounts.length === 0 || !currencyCode) return undefined;

  return { amount: Math.min(...amounts), currencyCode };
};
