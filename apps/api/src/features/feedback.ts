import express, { Router, type ErrorRequestHandler } from 'express';
import { sendError } from '../errors.ts';
import type { FeedbackOperations } from '../services/feedback.ts';

export function createFeedbackRouter(operations: FeedbackOperations) {
  const router = Router();
  router.post('/', express.json({ limit: '8kb' }), (req, res) => {
    if (!operations.submit(req.body)) return sendError(res, 400, 'INVALID_INPUT', 'Revisa la puntuación y el comentario.');
    res.status(201).json({ accepted: true });
  });
  router.get('/summary', (_req, res) => res.json(operations.summary()));
  const inputErrors: ErrorRequestHandler = (error, _req, res, next) => {
    if (error.type === 'entity.too.large') return sendError(res, 413, 'INVALID_INPUT', 'El envío supera el tamaño permitido.');
    if (error.type === 'entity.parse.failed') return sendError(res, 400, 'INVALID_INPUT', 'El JSON recibido es inválido.');
    next(error);
  };
  router.use(inputErrors);
  return router;
}
