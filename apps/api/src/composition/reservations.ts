import type { DatabaseSync } from 'node:sqlite';
import type { Router } from 'express';
import { reservations } from '../features/reservations.ts';

export const composeReservations: (connection: DatabaseSync) => Router = () => reservations;
