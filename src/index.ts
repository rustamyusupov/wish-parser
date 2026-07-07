import { openDb } from './db.js';

const dbPath = process.env.WISH_PARSER_DB_PATH;
if (!dbPath) {
  console.error('WISH_PARSER_DB_PATH is not set');
  process.exit(1);
}

const db = openDb(dbPath);
console.log(`wish-parser: ${db.selectWishes().length} wishes in database`);
db.close();
