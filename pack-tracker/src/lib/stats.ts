import type { Purchase } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface Stats {
  totalSpent: number;
  spentThisMonth: number;
  spentLastMonth: number;
  spentThisYear: number;
  averageWeeklySpend: number;
  averageMonthlySpend: number;
  totalPacks: number;
  packsThisMonth: number;
  longestGapDays: number;
  averageDaysPerPack: number;
  totalCigarettes: number;
  forecastYearlySpend: number;
  daysSinceLastPack: number | null;
}

function isSameMonth(ts: number, ref: Date): boolean {
  const d = new Date(ts);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function isSameYear(ts: number, ref: Date): boolean {
  return new Date(ts).getFullYear() === ref.getFullYear();
}

/** Whole days elapsed between two timestamps, floored. */
export function daysBetween(a: number, b: number): number {
  return Math.floor(Math.abs(b - a) / DAY_MS);
}

/**
 * Compute every derived figure from the purchase list.
 * `now` is injectable for deterministic tests.
 */
export function computeStats(purchases: Purchase[], now: Date = new Date()): Stats {
  const empty: Stats = {
    totalSpent: 0,
    spentThisMonth: 0,
    spentLastMonth: 0,
    spentThisYear: 0,
    averageWeeklySpend: 0,
    averageMonthlySpend: 0,
    totalPacks: 0,
    packsThisMonth: 0,
    longestGapDays: 0,
    averageDaysPerPack: 0,
    totalCigarettes: 0,
    forecastYearlySpend: 0,
    daysSinceLastPack: null,
  };
  if (purchases.length === 0) return empty;

  const sorted = [...purchases].sort((a, b) => a.timestamp - b.timestamp);
  const nowMs = now.getTime();
  const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const totalSpent = sorted.reduce((sum, p) => sum + p.price, 0);
  const spentThisMonth = sorted
    .filter((p) => isSameMonth(p.timestamp, now))
    .reduce((sum, p) => sum + p.price, 0);
  const spentLastMonth = sorted
    .filter((p) => isSameMonth(p.timestamp, lastMonthRef))
    .reduce((sum, p) => sum + p.price, 0);
  const spentThisYear = sorted
    .filter((p) => isSameYear(p.timestamp, now))
    .reduce((sum, p) => sum + p.price, 0);

  const first = sorted[0].timestamp;
  const last = sorted[sorted.length - 1].timestamp;
  // At least one day of history so single-purchase averages stay finite.
  const elapsedDays = Math.max(1, (nowMs - first) / DAY_MS);

  // Never extrapolate from less than one period of history: in the first
  // week the "weekly average" is simply what's been spent so far, becoming a
  // true rate once at least a full week (or month) has elapsed.
  const averageWeeklySpend = totalSpent / (Math.max(7, elapsedDays) / 7);
  const averageMonthlySpend = totalSpent / (Math.max(30.44, elapsedDays) / 30.44);

  const totalPacks = sorted.length;
  const packsThisMonth = sorted.filter((p) => isSameMonth(p.timestamp, now)).length;

  let longestGapDays = 0;
  for (let i = 1; i < sorted.length; i++) {
    longestGapDays = Math.max(
      longestGapDays,
      daysBetween(sorted[i - 1].timestamp, sorted[i].timestamp),
    );
  }

  const averageDaysPerPack = elapsedDays / totalPacks;
  const totalCigarettes = sorted.reduce((sum, p) => sum + p.packSize, 0);

  // Current monthly rate: spend over the trailing 30 days, projected to a year.
  const trailing30 = sorted
    .filter((p) => nowMs - p.timestamp <= 30 * DAY_MS)
    .reduce((sum, p) => sum + p.price, 0);
  const forecastYearlySpend = trailing30 * 12;

  const daysSinceLastPack = daysBetween(last, nowMs);

  return {
    totalSpent,
    spentThisMonth,
    spentLastMonth,
    spentThisYear,
    averageWeeklySpend,
    averageMonthlySpend,
    totalPacks,
    packsThisMonth,
    longestGapDays,
    averageDaysPerPack,
    totalCigarettes,
    forecastYearlySpend,
    daysSinceLastPack,
  };
}
