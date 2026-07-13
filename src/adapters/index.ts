import type { Adapter } from '#types';
import { aliexpress } from './aliexpress.ts';
import { avito } from './avito.ts';
import { bike24 } from './bike24.ts';
import { jsonld } from './jsonld.ts';
import { shopify } from './shopify.ts';

const ADAPTER_BY_HOST: Record<string, Adapter> = {
  'tradeinn.com': jsonld,
  'plastinka.com': jsonld,
  'doctorhead.ru': jsonld,
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
