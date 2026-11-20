CREATE TABLE venues (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, address TEXT NOT NULL,
  description TEXT NOT NULL, accessibilityNotes TEXT NOT NULL, image TEXT NOT NULL
) STRICT;

CREATE TABLE artists (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, bio TEXT NOT NULL,
  country TEXT NOT NULL, discipline TEXT NOT NULL, image TEXT NOT NULL
) STRICT;

CREATE TABLE events (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
  startAt TEXT NOT NULL CHECK (startAt LIKE '%-05:00'), endAt TEXT NOT NULL CHECK (endAt LIKE '%-05:00' AND endAt > startAt),
  venueId TEXT NOT NULL REFERENCES venues(id), priceCents INTEGER NOT NULL CHECK (priceCents >= 0),
  capacity INTEGER NOT NULL CHECK (capacity >= 0), reservable INTEGER NOT NULL CHECK (reservable IN (0,1)),
  image TEXT NOT NULL
) STRICT;

CREATE TABLE event_artists (
  eventId TEXT NOT NULL REFERENCES events(id), artistId TEXT NOT NULL REFERENCES artists(id),
  position INTEGER NOT NULL CHECK (position >= 0), PRIMARY KEY(eventId, artistId), UNIQUE(eventId, position)
) STRICT;

CREATE INDEX events_schedule ON events(startAt, id);
