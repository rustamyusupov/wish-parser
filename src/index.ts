import { openDb } from './db.js';

const dbPath = process.env.WISH_PARSER_DB_PATH;
if (!dbPath) {
  console.error('WISH_PARSER_DB_PATH не задан');
  process.exit(1);
}

const db = openDb(dbPath);
console.log(`wish-parser: в базе ${db.selectWishes().length} желаний`);
db.close();
