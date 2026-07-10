import { PAGE_GOTO_TIMEOUT_MS } from '#constants';
import { getPage } from '#lib/browser';
import type { Adapter } from '#types';

const PRICE_BLOCK_SELECTOR = '[class*="HazeProductPrice"]';
const PRICE_WAIT_MS = 25_000;
const PRICE_RE = /\d[\d\s]{0,12}₽/;
const UNAVAILABLE_RE = /нет в наличии|товар (недоступен|закончился|не найден)/i;
const TITLE_TAIL_RE = /\s*[-|]\s*aliexpress.*$/i;

export const aliexpress: Adapter = async (link) => {
  const page = await getPage();

  try {
    const response = await page.goto(link, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_GOTO_TIMEOUT_MS,
    });

    if (response?.status() === 404) return { available: false };
    if (response && response.status() >= 400) {
      throw new Error(`aliexpress: HTTP ${response.status()}`);
    }

    const block = page.locator(PRICE_BLOCK_SELECTOR, { hasText: PRICE_RE }).first();
    const found = await block.waitFor({ timeout: PRICE_WAIT_MS }).then(
      () => true,
      () => false,
    );

    if (found) {
      const match = PRICE_RE.exec(await block.innerText());

      if (match) {
        const name = (await page.title()).replace(TITLE_TAIL_RE, '').trim() || undefined;

        return {
          available: true,
          amount: Number(match[0].replace(/\D/g, '')),
          currencyCode: 'RUB',
          name,
        };
      }
    }

    await page.context().clearCookies();

    if (page.url().includes('punish')) throw new Error('aliexpress: bot check page');

    const text = await page.locator('body').innerText();

    if (UNAVAILABLE_RE.test(text)) return { available: false };

    throw new Error('aliexpress: price not found on page');
  } finally {
    await page.close();
  }
};
