import type { DatabaseSync } from 'node:sqlite';
import { artistSchema, eventsSchema, venueSchema } from '@fiavl/contracts';
import fixtures from './fixtures.json' with { type: 'json' };
import { transaction } from './db.ts';

export function seed(db: DatabaseSync, onlyIfEmpty = false) {
  const venues = venueSchema.array().parse(fixtures.venues);
  const artists = artistSchema.array().parse(fixtures.artists);
  const events = eventsSchema.parse(fixtures.events);
  transaction(db, () => {
    if (onlyIfEmpty && ['events', 'artists', 'venues'].some(table =>
      db.prepare('SELECT 1 FROM ' + table + ' LIMIT 1').get()
    )) return;
    const venue = db.prepare('INSERT INTO venues (id,name,address,description,accessibilityNotes,image) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING');
    const artist = db.prepare('INSERT INTO artists (id,name,bio,country,discipline,image) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING');
    const event = db.prepare('INSERT INTO events (id,title,description,category,startAt,endAt,venueId,priceCents,capacity,reservable,image) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING');
    const link = db.prepare('INSERT INTO event_artists (eventId,artistId,position) VALUES (?,?,?) ON CONFLICT(eventId,artistId) DO NOTHING');
    for (const v of venues) venue.run(v.id, v.name, v.address, v.description, v.accessibilityNotes, v.image);
    for (const a of artists) artist.run(a.id, a.name, a.bio, a.country, a.discipline, a.image);
    for (const e of events) {
      event.run(e.id, e.title, e.description, e.category, e.startAt, e.endAt, e.venueId, e.priceCents, e.capacity, Number(e.reservable), e.image);
      e.artistIds.forEach((id, position) => link.run(e.id, id, position));
    }
  });
}
