// Hybrid recommendation scoring — implements ספר הפרויקט §4.2.3.
// Final_Score(category) = w1 * Preference_Score + w2 * Normalized_Purchase_Count
// Normalized_Purchase_Count = min(5, 1 + 4 * purchaseCount / 10)

export const DEFAULT_W1 = 0.6; // weight of stated preferences
export const DEFAULT_W2 = 0.4; // weight of actual purchase behaviour

export function normalizedPurchaseScore(purchaseCount: number): number {
  return Math.min(5, 1 + (4 * purchaseCount) / 10);
}

export function finalScore(
  prefScore: number,
  purchaseCount: number,
  w1: number = DEFAULT_W1,
  w2: number = DEFAULT_W2,
): number {
  return w1 * prefScore + w2 * normalizedPurchaseScore(purchaseCount);
}

export type Genre = 'music' | 'sports' | 'theater';

interface RankableEvent {
  genre: Genre;
}

/**
 * Rank events by the hybrid score of their genre.
 * @param events           events to rank
 * @param prefByGenre      0–5 preference score per genre (from the onboarding questionnaire)
 * @param countByGenre     how many tickets the user has bought per genre
 */
export function rankEvents<T extends RankableEvent>(
  events: T[],
  prefByGenre: Partial<Record<Genre, number>>,
  countByGenre: Partial<Record<Genre, number>>,
): T[] {
  const scoreFor = (g: Genre) => finalScore(prefByGenre[g] ?? 0, countByGenre[g] ?? 0);
  return [...events].sort((a, b) => scoreFor(b.genre) - scoreFor(a.genre));
}
