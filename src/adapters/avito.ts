import { ogTitle } from '#lib/html';
import { fetchPage } from '#lib/http';
import type { Adapter } from '#types';

const PRICE_RE = /data-marker="item-view\/item-price"[^>]*>([^<]+)/;
const CURRENCY_RE = /itemprop="priceCurrency" content="([A-Z]{3})"/i;
const TITLE_RE = /data-marker="item-view\/title-info"[^>]*>([^<]+)/;
const REMOVED_RE = /снято с публикации|больше не размещено|item-closed/i;

export const avito: Adapter = async (link) => {
  const response = await fetchPage(link);

  if (response.status === 404) return { available: false };
  if (!response.ok) throw new Error(`avito: HTTP ${response.status}`);

  const html = await response.text();
  const amount = Number(PRICE_RE.exec(html)?.[1]?.replace(/\D/g, ''));
  const currencyCode = CURRENCY_RE.exec(html)?.[1];

  if (Number.isFinite(amount) && amount > 0 && currencyCode) {
    const name = TITLE_RE.exec(html)?.[1]?.trim() || ogTitle(html);
    return { available: true, amount, currencyCode, name };
  }

  if (REMOVED_RE.test(html)) return { available: false };

  throw new Error('avito: price not found on page');
};
