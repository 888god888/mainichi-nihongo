import { describe, expect, it } from "vitest";
import { calculateStreak, localDateKey } from "./dates";

describe("localDateKey", () => {
  it("補零並使用本地日期", () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(localDateKey(new Date(2026, 11, 31, 0, 0))).toBe("2026-12-31");
  });
});

describe("calculateStreak", () => {
  const today = new Date(2026, 9, 8, 10, 0);

  it("沒有紀錄時為 0", () => {
    expect(calculateStreak([], today)).toBe(0);
  });

  it("今天已完成：含今天往回算", () => {
    expect(calculateStreak(["2026-10-08", "2026-10-07", "2026-10-06"], today)).toBe(3);
  });

  it("今天尚未完成：從昨天往回算，不會歸零", () => {
    expect(calculateStreak(["2026-10-07", "2026-10-06"], today)).toBe(2);
  });

  it("中間缺一天就中斷", () => {
    expect(calculateStreak(["2026-10-08", "2026-10-06", "2026-10-05"], today)).toBe(1);
  });

  it("昨天和今天都沒完成則為 0", () => {
    expect(calculateStreak(["2026-10-05"], today)).toBe(0);
  });

  it("可跨月與跨年", () => {
    expect(calculateStreak(["2026-01-01", "2025-12-31", "2025-12-30"], new Date(2026, 0, 1))).toBe(3);
    expect(calculateStreak(["2026-03-01", "2026-02-28"], new Date(2026, 2, 1))).toBe(2);
  });
});
