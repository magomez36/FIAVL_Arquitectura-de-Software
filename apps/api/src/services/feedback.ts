import { feedbackInputSchema, type FeedbackInput, type FeedbackSummary } from '@fiavl/contracts';

export interface FeedbackRepository {
  insert(input: FeedbackInput): void;
  counts(): { rating: number; count: number }[];
}

export function createFeedbackService(repository: FeedbackRepository) {
  return {
    submit(raw: unknown) {
      const result = feedbackInputSchema.safeParse(raw);
      if (!result.success) return false;
      repository.insert(result.data);
      return true;
    },
    summary(): FeedbackSummary {
      const distribution: FeedbackSummary['distribution'] = [0, 0, 0, 0, 0];
      let total = 0;
      let sum = 0;
      for (const { rating, count } of repository.counts()) {
        distribution[rating - 1] = count;
        total += count;
        sum += rating * count;
      }
      return { total, distribution, average: total ? Math.round(sum / total * 10) / 10 : null };
    }
  };
}
export type FeedbackOperations = ReturnType<typeof createFeedbackService>;
