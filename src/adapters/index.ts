import type { Adapter } from '../types.js';
import { aliexpress } from './aliexpress.js';
import { avito } from './avito.js';
import { bike24 } from './bike24.js';
import { shopify } from './shopify.js';
import { tradeinn } from './tradeinn.js';

const ADAPTER_BY_HOST: Record<string, Adapter> = {
  'tradeinn.com': tradeinn,
  'tons.bike': shopify,
  'avito.ru': avito,
  'ali.click': aliexpress,
  'aliexpress.ru': aliexpress,
  'bike24.com': bike24,
};

export const adapterFor = (link: string) => {
  const { hostname } = new URL(link);
  return Object.entries(ADAPTER_BY_HOST).find(
    ([host]) => hostname === host || hostname.endsWith(`.${host}`),
  )?.[1];
};
