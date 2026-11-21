import type { DatabaseSync } from 'node:sqlite';
import { createFeedbackRouter } from '../features/feedback.ts';
import { createFeedbackRepository } from '../repositories/feedback.ts';
import { createFeedbackService } from '../services/feedback.ts';

export function composeFeedback(connection: DatabaseSync) {
  return createFeedbackRouter(createFeedbackService(createFeedbackRepository(connection)));
}
