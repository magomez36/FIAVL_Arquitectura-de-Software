-- Reservas demostrativas de aforo (Spec 6). Sin datos personales.
-- referenceHash guarda el SHA-256 de la referencia opaca; la referencia en claro solo la conoce quien reserva.
CREATE TABLE reservations (
  id INTEGER PRIMARY KEY,
  referenceHash TEXT NOT NULL UNIQUE CHECK (length(referenceHash) = 64),
  eventId TEXT NOT NULL REFERENCES events(id),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled')),
  createdAt TEXT NOT NULL CHECK (createdAt LIKE '%-05:00'),
  cancelledAt TEXT CHECK (cancelledAt LIKE '%-05:00'),
  CHECK ((status = 'cancelled') = (cancelledAt IS NOT NULL))
) STRICT;

CREATE INDEX reservations_event_status ON reservations(eventId, status);
