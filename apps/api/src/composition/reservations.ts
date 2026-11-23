import type { DatabaseSync } from 'node:sqlite';
import { createReservationsRouter } from '../features/reservations.ts';
import { createReservationRepository } from '../repositories/reservations.ts';
import { createReservationService } from '../services/reservations.ts';

export function composeReservations(connection: DatabaseSync) {
  return createReservationsRouter(createReservationService(createReservationRepository(connection)));
}
