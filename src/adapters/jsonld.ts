import { fetchPage } from '#lib/http';
import { extractOffers, nameFromLd, priceFromOffers } from '#lib/jsonld';
import type { Adapter } from '#types';

export const jsonld: Adapter = async (link) => {
  const { hostname } = new URL(link);
  const response = await fetchPage(link);

  if (response.status === 404) return { available: false };
  if (!response.ok) throw new Error(`${hostname}: HTTP ${response.status}`);

  const html = await response.text();
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
