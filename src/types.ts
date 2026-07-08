export type WishRow = {
  id: number;
  name: string;
  link: string;
};

export type AdapterResult =
  { available: true; amount: number; currencyCode: string } | { available: false };

export type Adapter = (link: string) => Promise<AdapterResult>;

export type LdOffer = {
  price?: string | number;
  lowPrice?: string | number;
  priceCurrency?: string;
  url?: string;
};

export type Engine = 'chromium' | 'webkit';

export type Outcome = 'saved' | 'unavailable' | 'failed';

export type RunOptions = {
  filter?: (wish: WishRow) => boolean;
  dryRun?: boolean;
};

export type ShopifyProduct = {
  variants: { id: number; price: number; available: boolean }[];
};
