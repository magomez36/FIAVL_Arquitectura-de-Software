import type { DatabaseSync } from 'node:sqlite';
import type { Router } from 'express';
import { feedback } from '../features/feedback.ts';

export const composeFeedback: (connection: DatabaseSync) => Router = () => feedback;
