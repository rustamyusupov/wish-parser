import { parseArgs } from 'node:util';

import { USAGE } from './constants.js';
import type { WishRow } from './types.js';

export const printUsage = () => console.log(USAGE);

export const exitWithError = (error: unknown): never => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
};

export const parseCli = () => {
  try {
    return parseArgs({
      options: {
        only: { type: 'string' },
        'dry-run': { type: 'boolean', default: false },
        help: { type: 'boolean', default: false },
      },
    }).values;
  } catch (error) {
    console.error(USAGE);
    return exitWithError(error);
  }
};

export const matchesOnly = (only?: string) => (wish: WishRow) =>
  !only || String(wish.id) === only || new URL(wish.link).hostname.includes(only);
