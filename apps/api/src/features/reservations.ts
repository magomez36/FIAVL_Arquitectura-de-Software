import { Router } from 'express';
import { sendError } from '../errors.ts';

export const reservations = Router();
reservations.use((_req, res) => sendError(res, 501, 'NOT_IMPLEMENTED', 'Reservas aún no está disponible.'));
