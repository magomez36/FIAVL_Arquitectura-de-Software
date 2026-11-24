import express, { Router, type ErrorRequestHandler, type Response } from 'express';
import { sendError } from '../errors.ts';
import type { ReservationOperations, ReservationView } from '../services/reservations.ts';

const invalidReference = (res: Response) => sendError(res, 400, 'INVALID_ID', 'Referencia de reserva inválida.');
const unknownReservation = (res: Response) => sendError(res, 404, 'NOT_FOUND', 'Reserva no encontrada.');
const unknownEvent = (res: Response) => sendError(res, 404, 'NOT_FOUND', 'Evento no encontrado.');
const body = ({ reference, eventId, quantity, status, createdAt, cancelledAt }: ReservationView) =>
  ({ reference, eventId, quantity, status, createdAt, cancelledAt });

export function createReservationsRouter(operations: ReservationOperations) {
  const router = Router();
  // La referencia es un secreto de portador: nunca debe quedar en cachés.
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

  router.get('/availability', (_req, res) => res.json(operations.availability()));
  router.get('/availability/:eventId', (req, res) => {
    const result = operations.availabilityOf(req.params.eventId);
    if (result.kind === 'invalidId') return sendError(res, 400, 'INVALID_ID', 'Identificador inválido.');
    if (result.kind === 'notFound') return unknownEvent(res);
    res.json(result.availability);
  });

  router.post('/', express.json({ limit: '1kb' }), (req, res) => {
    const result = operations.create(req.body);
    switch (result.kind) {
      case 'invalid': return sendError(res, 400, 'INVALID_INPUT', 'Indica un evento y una cantidad entera de 1 a 10.');
      case 'eventNotFound': return unknownEvent(res);
      case 'notReservable': return sendError(res, 422, 'INVALID_INPUT', 'Este evento no admite reserva.');
      case 'insufficient': return sendError(res, 409, 'INVALID_INPUT',
        result.remaining === 0 ? 'No quedan plazas disponibles.'
          : result.remaining === 1 ? 'Solo queda 1 plaza disponible.' : `Solo quedan ${result.remaining} plazas disponibles.`);
      case 'created':
        return void res.status(201).json({ ...body(result.reservation), remaining: result.remaining });
    }
  });

  router.get('/:reference', (req, res) => {
    const result = operations.find(req.params.reference);
    if (result.kind === 'invalidReference') return invalidReference(res);
    if (result.kind === 'notFound') return unknownReservation(res);
    res.json(body(result.reservation));
  });
  router.post('/:reference/cancel', (req, res) => {
    const result = operations.cancel(req.params.reference);
    if (result.kind === 'invalidReference') return invalidReference(res);
    if (result.kind === 'notFound') return unknownReservation(res);
    res.json(body(result.reservation));
  });

  const inputErrors: ErrorRequestHandler = (error, _req, res, next) => {
    if (error.type === 'entity.too.large') return sendError(res, 413, 'INVALID_INPUT', 'El envío supera el tamaño permitido.');
    if (error.type === 'entity.parse.failed') return sendError(res, 400, 'INVALID_INPUT', 'El JSON recibido es inválido.');
    next(error);
  };
  router.use(inputErrors);
  return router;
}
