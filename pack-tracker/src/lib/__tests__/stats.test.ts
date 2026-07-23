import { describe, expect, it } from "vitest";
import { computeStats, daysBetween } from "../stats";
import type { Purchase } from "../types";

let counter = 0;
function p(dateISO: string, price = 10, packSize = 20, brand = "Marlboro Red"): Purchase {
  return { id: `p${counter++}`, timestamp: new Date(dateISO).getTime(), brand, packSize, price };
}

// Fixed "now" for determinism: June 15, 2026, noon local time.
const NOW = new Date(2026, 5, 15, 12, 0, 0);

describe("computeStats — empty and single-purchase edge cases", () => {
  it("returns all zeros with no purchases", () => {
    const s = computeStats([], NOW);
    expect(s.totalSpent).toBe(0);
    expect(s.spentThisMonth).toBe(0);
    expect(s.spentLastMonth).toBe(0);
    expect(s.spentThisYear).toBe(0);
    expect(s.averageWeeklySpend).toBe(0);
    expect(s.averageMonthlySpend).toBe(0);
    expect(s.totalPacks).toBe(0);
    expect(s.packsThisMonth).toBe(0);
    expect(s.longestGapDays).toBe(0);
    expect(s.averageDaysPerPack).toBe(0);
    expect(s.totalCigarettes).toBe(0);
    expect(s.forecastYearlySpend).toBe(0);
    expect(s.daysSinceLastPack).toBeNull();
  });

  it("handles a single purchase without dividing by zero", () => {
    const s = computeStats([p("2026-06-15T10:00:00", 9.5, 20)], NOW);
    expect(s.totalSpent).toBe(9.5);
    expect(s.totalPacks).toBe(1);
    expect(s.totalCigarettes).toBe(20);
    expect(s.longestGapDays).toBe(0);
    expect(s.daysSinceLastPack).toBe(0);
    expect(Number.isFinite(s.averageWeeklySpend)).toBe(true);
    expect(Number.isFinite(s.averageDaysPerPack)).toBe(true);
    expect(s.averageWeeklySpend).toBeGreaterThan(0);
  });

  it("a purchase made this instant still yields finite averages", () => {
    const s = computeStats([p(NOW.toISOString(), 10)], NOW);
    // elapsedDays clamps to 1, so weekly avg = 10 / (1/7) = 70
    expect(s.averageWeeklySpend).toBeCloseTo(70, 5);
    expect(s.averageDaysPerPack).toBeCloseTo(1, 5);
  });
});

describe("computeStats — money", () => {
  it("sums totals and splits this month / last month / this year", () => {
    const purchases = [
      p("2025-12-20T09:00:00", 8), // last year
      p("2026-05-03T09:00:00", 10), // last month
      p("2026-05-28T21:00:00", 11), // last month
      p("2026-06-01T00:30:00", 12), // this month (month boundary)
      p("2026-06-14T09:00:00", 13), // this month
    ];
    const s = computeStats(purchases, NOW);
    expect(s.totalSpent).toBe(54);
    expect(s.spentThisMonth).toBe(25);
    expect(s.spentLastMonth).toBe(21);
    expect(s.spentThisYear).toBe(46);
  });

  it("handles the January → December last-month boundary", () => {
    const janNow = new Date(2026, 0, 10, 12, 0, 0);
    const purchases = [p("2025-12-31T23:00:00", 9), p("2026-01-05T10:00:00", 10)];
    const s = computeStats(purchases, janNow);
    expect(s.spentThisMonth).toBe(10);
    expect(s.spentLastMonth).toBe(9);
    expect(s.spentThisYear).toBe(10);
  });

  it("computes weekly and monthly averages over elapsed time", () => {
    // Two purchases, first 14 days before NOW → elapsed = 14 days = 2 weeks.
    const purchases = [p("2026-06-01T12:00:00", 10), p("2026-06-10T12:00:00", 10)];
    const s = computeStats(purchases, NOW);
    expect(s.averageWeeklySpend).toBeCloseTo(20 / 2, 5);
    expect(s.averageMonthlySpend).toBeCloseTo(20 / (14 / 30.44), 5);
  });
});

describe("computeStats — packs and gaps", () => {
  it("counts packs and packs this month", () => {
    const purchases = [
      p("2026-05-30T10:00:00"),
      p("2026-06-02T10:00:00"),
      p("2026-06-10T10:00:00"),
    ];
    const s = computeStats(purchases, NOW);
    expect(s.totalPacks).toBe(3);
    expect(s.packsThisMonth).toBe(2);
  });

  it("finds the longest gap between consecutive purchases", () => {
    const purchases = [
      p("2026-05-01T10:00:00"),
      p("2026-05-03T10:00:00"), // 2 days
      p("2026-05-13T10:00:00"), // 10 days ← longest
      p("2026-05-18T10:00:00"), // 5 days
    ];
    expect(computeStats(purchases, NOW).longestGapDays).toBe(10);
  });

  it("longest gap is order-independent (unsorted input)", () => {
    const purchases = [
      p("2026-05-13T10:00:00"),
      p("2026-05-01T10:00:00"),
      p("2026-05-18T10:00:00"),
      p("2026-05-03T10:00:00"),
    ];
    expect(computeStats(purchases, NOW).longestGapDays).toBe(10);
  });

  it("computes average days per pack", () => {
    // First purchase 10 days before NOW, 5 packs → 2 days per pack.
    const purchases = [
      p("2026-06-05T12:00:00"),
      p("2026-06-07T12:00:00"),
      p("2026-06-09T12:00:00"),
      p("2026-06-11T12:00:00"),
      p("2026-06-13T12:00:00"),
    ];
    expect(computeStats(purchases, NOW).averageDaysPerPack).toBeCloseTo(2, 5);
  });

  it("reports days since last pack", () => {
    const purchases = [p("2026-06-12T12:00:00")];
    expect(computeStats(purchases, NOW).daysSinceLastPack).toBe(3);
  });
});

describe("computeStats — cigarettes", () => {
  it("multiplies each pack by its own size", () => {
    const purchases = [
      p("2026-06-01T10:00:00", 10, 20),
      p("2026-06-02T10:00:00", 10, 25),
      p("2026-06-03T10:00:00", 10, 10),
    ];
    expect(computeStats(purchases, NOW).totalCigarettes).toBe(55);
  });
});

describe("computeStats — forecast", () => {
  it("projects trailing-30-day spend to a year", () => {
    const purchases = [
      p("2026-06-10T12:00:00", 10),
      p("2026-06-01T12:00:00", 10),
      p("2026-04-01T12:00:00", 100), // outside trailing 30 days — excluded
    ];
    expect(computeStats(purchases, NOW).forecastYearlySpend).toBe(240);
  });

  it("is zero when all purchases are older than 30 days", () => {
    const purchases = [p("2026-01-01T12:00:00", 50)];
    expect(computeStats(purchases, NOW).forecastYearlySpend).toBe(0);
  });
});

describe("computeStats — deletion behavior", () => {
  it("recomputes correctly after an entry is removed", () => {
    const a = p("2026-06-01T10:00:00", 10);
    const b = p("2026-06-05T10:00:00", 12);
    const c = p("2026-06-14T10:00:00", 14);
    const before = computeStats([a, b, c], NOW);
    expect(before.totalSpent).toBe(36);
    expect(before.longestGapDays).toBe(9);

    const after = computeStats([a, c], NOW);
    expect(after.totalSpent).toBe(24);
    expect(after.totalPacks).toBe(2);
    expect(after.longestGapDays).toBe(13);
  });
});

describe("daysBetween", () => {
  it("floors partial days and is symmetric", () => {
    const a = new Date("2026-06-01T10:00:00").getTime();
    const b = new Date("2026-06-03T09:00:00").getTime();
    expect(daysBetween(a, b)).toBe(1);
    expect(daysBetween(b, a)).toBe(1);
  });
});
