import { Router } from 'express';
import { sendError } from '../errors.ts';

export const feedback = Router();
feedback.use((_req, res) => sendError(res, 501, 'NOT_IMPLEMENTED', 'Opiniones aún no está disponible.'));
