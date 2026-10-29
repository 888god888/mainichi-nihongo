import type { GrammarQuestion } from '../data/grammar-practice';
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30];
export type GrammarReview = { stage: number; due: string; wrong: number; lastDate: string; lastVariant: number };
export type GrammarReviewBook = Record<string, GrammarReview>;
export function shuffleItems<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function addDateDays(date: string, days: number): string {
  // 日曆日期加天，避免夏令時間／UTC 午夜影響本地日期。
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}
export function recordGrammarResult(previous: GrammarReview | undefined, correct: boolean, date: string, variant: number): GrammarReview {
  if (!correct) return { stage: 0, due: date, wrong: (previous?.wrong ?? 0) + 1, lastDate: date, lastVariant: variant };
  // 同一天反覆練習不升級，提前練習也不往後推遲原本的到期日。
  if (previous && previous.due > date) return { ...previous, lastVariant: variant };
  const stage = previous && previous.lastDate !== date ? Math.min(previous.stage + 1, REVIEW_INTERVALS.length - 1) : previous?.stage ?? 0;
  return { stage, due: addDateDays(date, REVIEW_INTERVALS[stage]), wrong: previous?.wrong ?? 0, lastDate: date, lastVariant: variant };
}
export function dueGrammarTitles(book: GrammarReviewBook, date: string, validTitles: string[]): string[] {
  return Object.keys(book).filter(title => validTitles.includes(title) && book[title].due <= date)
    .sort((a, b) => book[a].due.localeCompare(book[b].due) || book[b].wrong - book[a].wrong);
}
export function retryWithAlternate(queue: GrammarQuestion[], alternate: GrammarQuestion, random = Math.random): GrammarQuestion[] {
  const remaining = queue.slice(1);
  // 有其他題時至少先做另一題；剩最後一題時仍會先停在解析，按繼續才重考。
  const earliest = Math.min(1, remaining.length);
  const index = earliest + Math.floor(random() * (remaining.length - earliest + 1));
  remaining.splice(index, 0, alternate);
  return remaining;
}
