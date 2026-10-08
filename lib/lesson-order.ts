export type HistoryRow = {
  lesson_date: string;
  completed: boolean;
  lesson_number?: number | null;
};

/**
 * 今天要學哪一課（0 起算）：接續最近一次「完成」的那一課。
 * 沒有完成紀錄（新使用者）就從第 1 課開始；中途跳過幾天也不會跳過課程內容。
 */
export function nextLessonIndex(rows: HistoryRow[], lessonCount: number) {
  if (lessonCount <= 0) return 0;
  const lastCompleted = rows
    .filter((row) => row.completed && row.lesson_number && row.lesson_number > 0)
    .sort((a, b) => b.lesson_date.localeCompare(a.lesson_date))[0];
  if (!lastCompleted) return 0;
  // lesson_number 從 1 起算，所以 % lessonCount 剛好就是「下一課」的 0 起算索引，學完最後一課後回到第 1 課。
  return (lastCompleted.lesson_number as number) % lessonCount;
}
