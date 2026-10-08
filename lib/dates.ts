const pad = (value: number) => String(value).padStart(2, "0");

/** 以裝置本地時區產生 YYYY-MM-DD，與資料庫 lesson_date 欄位格式一致。 */
export function localDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 從今天（若今天尚未完成則從昨天）往回數，連續完成的天數。 */
export function calculateStreak(completedDates: string[], today: Date) {
  const dates = new Set(completedDates);
  const cursor = new Date(today);
  if (!dates.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (dates.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
