import type { DatabaseSync } from 'node:sqlite';
import { createApp } from './app.ts';
import { createCatalogService } from './catalog.ts';
import { createCatalogRepository } from './repositories/catalog.ts';
import { composeReservations } from './composition/reservations.ts';
import { composeFeedback } from './composition/feedback.ts';

export function composeApp(db: DatabaseSync) {
  return createApp({
    catalog: createCatalogService(createCatalogRepository(db)),
    reservations: composeReservations(db),
    feedback: composeFeedback(db)
  });
}
