import { run } from './run.js';

const dbPath = process.env.WISH_PARSER_DB_PATH;
if (!dbPath) {
  console.error('WISH_PARSER_DB_PATH is not set');
  process.exit(1);
}

await run(dbPath);
