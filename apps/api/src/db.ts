import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';

const defaultFile = fileURLToPath(new URL('../data/fiavl.sqlite', import.meta.url));
const migrations = new URL('../migrations/', import.meta.url);

export function transaction(db: DatabaseSync, work: () => void) {
  db.exec('BEGIN IMMEDIATE');
  try {
    work();
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function configuredFile() {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const envFile = resolve(root, '.env');
  const value = process.env.FIAVL_DB ||
    (existsSync(envFile) && parseEnv(readFileSync(envFile, 'utf8')).FIAVL_DB);
  if (value === ':memory:') return value;
  return value ? resolve(root, value) : defaultFile;
}

export function openDatabase(file = configuredFile()) {
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  try {
    db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000');
    transaction(db, () => {
      db.exec('CREATE TABLE IF NOT EXISTS migrations (number INTEGER PRIMARY KEY, name TEXT NOT NULL) STRICT');
      for (const name of readdirSync(migrations).filter(name => name.endsWith('.sql')).sort()) {
        const match = /^(\d{3})_[a-z0-9_]+\.sql$/.exec(name);
        if (!match) throw new Error('Nombre de migración inválido: ' + name);
        const number = Number(match[1]);
        const prior = db.prepare('SELECT name FROM migrations WHERE number=?').get(number);
        if (prior && prior.name !== name) throw new Error('Número duplicado: ' + name);
        if (prior) continue;
        db.exec(readFileSync(new URL(name, migrations), 'utf8'));
        db.prepare('INSERT INTO migrations VALUES (?,?)').run(number, name);
      }
    });
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}
