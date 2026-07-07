import Database from 'better-sqlite3';

import type { WishRow } from './types.js';

export const openDb = (path: string) => {
  const db = new Database(path, { fileMustExist: true });
  db.pragma('busy_timeout = 5000');
  db.pragma('foreign_keys = ON');

  const selectWishes = db.prepare('SELECT id, name, link FROM wishes ORDER BY id');
  const selectCurrencyId = db.prepare('SELECT id FROM currencies WHERE code = ?');
  const insertPrice = db.prepare(
    'INSERT INTO prices (wish_id, amount, currency_id, created_at) VALUES (?, ?, ?, unixepoch())',
  );

  return {
    selectWishes: () => selectWishes.all() as WishRow[],
    insertPrice: (wishId: number, amount: number, currencyCode: string) => {
      const currency = selectCurrencyId.get(currencyCode) as { id: number } | undefined;
      if (!currency) throw new Error(`Неизвестная валюта: ${currencyCode}`);
      insertPrice.run(wishId, amount, currency.id);
    },
    close: () => db.close(),
  };
};
