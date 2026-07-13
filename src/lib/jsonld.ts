type LdOffer = {
  price?: string | number;
  lowPrice?: string | number;
  priceCurrency?: string;
  url?: string;
  availability?: string;
};

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

const findProductName = (node: unknown): string | undefined => {
  if (Array.isArray(node)) {
    for (const item of node) {
      const name = findProductName(item);
      if (name) return name;
    }
    return undefined;
  }
  if (!node || typeof node !== 'object') return undefined;

  const record = node as { '@type'?: unknown; name?: unknown; offers?: unknown };
  const type = record['@type'];
  const isProduct = (Array.isArray(type) ? type : [type]).some(
    (value) => typeof value === 'string' && value.toLowerCase().includes('product'),
  );

  if ((isProduct || record.offers) && typeof record.name === 'string' && record.name.trim()) {
    return record.name.trim();
  }

  for (const value of Object.values(record)) {
    const name = findProductName(value);
    if (name) return name;
  }

  return undefined;
};

export const nameFromLd = (html: string): string | undefined => {
  for (const match of html.matchAll(LD_JSON_RE)) {
    if (!match[1]) continue;

    try {
      const name = findProductName(JSON.parse(match[1]));
      if (name) return name;
    } catch {
      /* empty */
    }
  }

  return undefined;
};

export const priceFromOffers = (offers: LdOffer[]) => {
  const amounts = offers
    .map(({ lowPrice, price }) => Number(lowPrice ?? price))
    .filter(Number.isFinite);
  const currencyCode = offers.find(({ priceCurrency }) => priceCurrency)?.priceCurrency;

  if (amounts.length === 0 || !currencyCode) return undefined;

  return { amount: Math.min(...amounts), currencyCode };
};
