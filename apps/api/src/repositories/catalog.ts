import type { DatabaseSync } from 'node:sqlite';
import { artistSchema, eventSchema, venueSchema } from '@fiavl/contracts';
import type { CatalogRepository } from '../catalog.ts';

export function createCatalogRepository(db: DatabaseSync): CatalogRepository {
  return {
    checkReadable() {
      db.prepare('SELECT id FROM events LIMIT 1').get();
    },
    read(collection, id) {
      const filter = id === undefined ? '' : ' WHERE id = ?';
      const args = id === undefined ? [] : [id];
      if (collection === 'events') {
        const rows = db.prepare(`SELECT events.*, (
          SELECT json_group_array(artistId ORDER BY position) FROM event_artists WHERE eventId=events.id
        ) AS artistIds FROM events` + filter + ' ORDER BY startAt,id').all(...args);
        return rows.map(row => eventSchema.parse({
          ...row, artistIds: JSON.parse(String(row.artistIds)), reservable: row.reservable === 1
        }));
      }
      const rows = db.prepare('SELECT * FROM ' + collection + filter + ' ORDER BY id').all(...args);
      return collection === 'artists' ? artistSchema.array().parse(rows) : venueSchema.array().parse(rows);
    }
  };
}
