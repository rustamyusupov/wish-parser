import { exitWithError, matchesOnly, parseCli, printUsage } from './cli.js';
import { requireEnv } from './lib/env.js';
import { run } from './run.js';

const main = async () => {
  const { help, only, 'dry-run': dryRun } = parseCli();

  if (help) return printUsage();

  const dbPath = requireEnv('WISH_PARSER_DB_PATH');

  await run(dbPath, { filter: matchesOnly(only), dryRun });
};

await main().catch(exitWithError);
