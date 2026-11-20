import express, { type ErrorRequestHandler, type Router } from 'express';
import type { CatalogService } from './catalog.ts';
import { sendError } from './errors.ts';

interface AppDependencies {
  catalog: CatalogService;
  reservations: Router;
  feedback: Router;
}

export function createApp({ catalog, reservations, feedback }: AppDependencies) {
  const app = express();
  app.disable('x-powered-by');
  app.get('/api/health', (_req, res) => res.json(catalog.health()));
  for (const resource of ['events', 'artists', 'venues'] as const) {
    app.get('/api/' + resource, (_req, res) => res.json(catalog.list(resource)));
    app.get('/api/' + resource + '/:id', (req, res) => {
      const result = catalog.detail(resource, req.params.id);
      if (result.kind === 'invalidId') return sendError(res, 400, 'INVALID_ID', 'Identificador inválido.');
      if (result.kind === 'notFound') return sendError(res, 404, 'NOT_FOUND', 'Ficha no encontrada.');
      res.json(result.item);
    });
  }
  app.use('/api/reservations', reservations);
  app.use('/api/feedback', feedback);
  app.use((_req, res) => sendError(res, 404, 'NOT_FOUND', 'Ruta no encontrada.'));
  const errors: ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof URIError) return sendError(res, 400, 'INVALID_ID', 'Identificador inválido.');
    console.error(error);
    sendError(res, 500, 'INTERNAL_ERROR', 'No se pudo consultar el catálogo.');
  };
  app.use(errors);
  return app;
}
