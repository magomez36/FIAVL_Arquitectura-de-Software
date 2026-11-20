import { openDatabase } from './db.ts';
import { seed } from './seed.ts';

const db = openDatabase();
try {
  seed(db, process.argv.includes('--if-empty'));
  console.log('Base de la edición preparada.');
} finally {
  db.close();
}
