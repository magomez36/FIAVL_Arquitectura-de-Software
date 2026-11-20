import { openDatabase } from './db.ts';
import { composeApp } from './composition.ts';

const db = openDatabase();
const server = composeApp(db).listen(3001, '127.0.0.1', () => console.log('FIAVL API · http://127.0.0.1:3001'));
function shutdown() {
  server.close(() => db.close());
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
