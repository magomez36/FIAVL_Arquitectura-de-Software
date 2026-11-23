import type { DatabaseSync } from 'node:sqlite';
import type { ReservationRepository, ReservationRow, ReservationStore } from '../services/reservations.ts';

export function createReservationRepository(db: DatabaseSync): ReservationRepository {
  const listEvents = db.prepare(`SELECT e.id, e.capacity, e.reservable,
    COALESCE((SELECT SUM(r.quantity) FROM reservations r WHERE r.eventId = e.id AND r.status = 'active'), 0) AS reserved
    FROM events e ORDER BY e.startAt, e.id`);
  const findEvent = db.prepare('SELECT id, capacity, reservable FROM events WHERE id = ?');
  const reservedFor = db.prepare("SELECT COALESCE(SUM(quantity), 0) AS reserved FROM reservations WHERE eventId = ? AND status = 'active'");
  const insert = db.prepare("INSERT INTO reservations (referenceHash, eventId, quantity, status, createdAt) VALUES (?, ?, ?, 'active', ?)");
  const findByHash = db.prepare('SELECT eventId, quantity, status, createdAt, cancelledAt FROM reservations WHERE referenceHash = ?');
  const cancel = db.prepare("UPDATE reservations SET status = 'cancelled', cancelledAt = ? WHERE referenceHash = ? AND status = 'active'");

  const store: ReservationStore = {
    findEvent(eventId) {
      const row = findEvent.get(eventId);
      return row ? { id: String(row.id), capacity: Number(row.capacity), reservable: row.reservable === 1 } : undefined;
    },
    reservedFor(eventId) { return Number(reservedFor.get(eventId)?.reserved ?? 0); },
    insert(referenceHash, eventId, quantity, createdAt) { insert.run(referenceHash, eventId, quantity, createdAt); },
    findByHash(referenceHash) {
      const row = findByHash.get(referenceHash);
      return row ? {
        eventId: String(row.eventId), quantity: Number(row.quantity), status: row.status as ReservationRow['status'],
        createdAt: String(row.createdAt), cancelledAt: row.cancelledAt === null ? null : String(row.cancelledAt)
      } : undefined;
    },
    cancel(referenceHash, cancelledAt) { cancel.run(cancelledAt, referenceHash); }
  };

  return {
    listEvents() {
      return listEvents.all().map(row => ({
        id: String(row.id), capacity: Number(row.capacity), reservable: row.reservable === 1, reserved: Number(row.reserved)
      }));
    },
    /** BEGIN IMMEDIATE toma el bloqueo de escritura antes de leer, de modo que comprobar y reservar sea atómico. */
    atomically(work) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const result = work(store);
        db.exec('COMMIT');
        return result;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    }
  };
}
