import { SHOPIFY_CURRENCY_CODE } from '../constants.js';
import { fetchPage } from '../lib/http.js';
import type { Adapter, ShopifyProduct } from '../types.js';

export const shopify: Adapter = async (link) => {
  const url = new URL(link);
  const variantId = url.searchParams.get('variant');

  const response = await fetchPage(`${url.origin}${url.pathname}.js`);
  if (response.status === 404) return { available: false };
  if (!response.ok) throw new Error(`shopify: HTTP ${response.status}`);

  const product = (await response.json()) as ShopifyProduct;
  const variant = variantId
    ? product.variants.find(({ id }) => String(id) === variantId)
    : product.variants[0];

  if (!variant?.available) return { available: false };
  return { available: true, amount: variant.price / 100, currencyCode: SHOPIFY_CURRENCY_CODE };
};
