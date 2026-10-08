import { describe, expect, it } from "vitest";
import { nextLessonIndex } from "./lesson-order";

const row = (lesson_date: string, lesson_number: number | null, completed = true) => ({ lesson_date, lesson_number, completed });

describe("nextLessonIndex", () => {
  it("新使用者從第 1 課開始", () => {
    expect(nextLessonIndex([], 73)).toBe(0);
  });

  it("接續最近完成的那一課", () => {
    expect(nextLessonIndex([row("2026-10-07", 5), row("2026-10-06", 4)], 73)).toBe(5);
  });

  it("以日期最近的完成紀錄為準，不受列表順序影響", () => {
    expect(nextLessonIndex([row("2026-10-01", 2), row("2026-10-07", 9), row("2026-10-03", 4)], 73)).toBe(9);
  });

  it("跳過幾天不會跳過課程", () => {
    expect(nextLessonIndex([row("2026-09-01", 12)], 73)).toBe(12);
  });

  it("沒完成的那天會重學同一課", () => {
    expect(nextLessonIndex([row("2026-10-07", 6, false), row("2026-10-06", 5)], 73)).toBe(5);
  });

  it("學完最後一課後回到第 1 課", () => {
    expect(nextLessonIndex([row("2026-10-07", 73)], 73)).toBe(0);
  });

  it("忽略缺少課次的舊資料", () => {
    expect(nextLessonIndex([row("2026-10-07", null), row("2026-10-06", 3)], 73)).toBe(3);
  });
});
