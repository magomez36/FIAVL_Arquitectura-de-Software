import type { DatabaseSync } from 'node:sqlite';
import type { FeedbackRepository } from '../services/feedback.ts';

export function createFeedbackRepository(db: DatabaseSync): FeedbackRepository {
  const insert = db.prepare('INSERT INTO feedback (rating, comment) VALUES (?, ?)');
  const counts = db.prepare('SELECT rating, count(*) AS count FROM feedback GROUP BY rating');
  return {
    insert(input) { insert.run(input.rating, input.comment || null); },
    counts() { return counts.all().map(row => ({ rating: Number(row.rating), count: Number(row.count) })); }
  };
}
