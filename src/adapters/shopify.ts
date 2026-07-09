import { fetchPage } from '#lib/http';
import type { Adapter } from '#types';

const SHOPIFY_CURRENCY_CODE = 'EUR';

type ShopifyProduct = {
  title: string;
  variants: { id: number; price: number; available: boolean }[];
};

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

  return {
    available: true,
    amount: variant.price / 100,
    currencyCode: SHOPIFY_CURRENCY_CODE,
    name: product.title,
  };
};
