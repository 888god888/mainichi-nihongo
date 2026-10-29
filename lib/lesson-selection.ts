export type LessonHistory = { lesson_number: number; completed: boolean; completed_words: number[]; completed_grammar: number[]; lesson_date: string };
export function selectLesson(total: number, today: { lesson_number: number } | null, history: LessonHistory[]): number {
  const valid = (number: number) => Number.isInteger(number) && number >= 1 && number <= total;
  if (today && valid(today.lesson_number)) return today.lesson_number - 1;
  const ordered = [...history].filter(row => valid(row.lesson_number)).sort((a,b) => b.lesson_date.localeCompare(a.lesson_date));
  if (!ordered.length) return 0;
  if (!ordered[0].completed) return ordered[0].lesson_number - 1;
  const learned = new Set(ordered.filter(row => row.completed).map(row => row.lesson_number - 1));
  const start = ordered[0].lesson_number % total;
  for (let i=0;i<total;i++) { const index=(start+i)%total; if (!learned.has(index)) return index; }
  return start;
}
