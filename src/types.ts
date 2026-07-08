export type AdapterResult =
  { available: true; amount: number; currencyCode: string } | { available: false };

export type Adapter = (link: string) => Promise<AdapterResult>;
