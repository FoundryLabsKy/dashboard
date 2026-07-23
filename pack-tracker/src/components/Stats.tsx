import { useMemo } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";
import { computeStats } from "../lib/stats";
import { formatMoney } from "../lib/format";
import AnimatedNumber from "./AnimatedNumber";

interface StatItem {
  label: string;
  value: number;
  money?: boolean;
  decimals?: number;
  suffix?: string;
}

interface Section {
  title: string;
  items: StatItem[];
}

const container = {
  animate: { transition: { staggerChildren: 0.05 } },
};
const rise = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 320, damping: 30 },
  },
};

export default function Stats() {
  const { purchases, settings } = useApp();
  const stats = useMemo(() => computeStats(purchases), [purchases]);

  const money = (n: number) => formatMoney(n, settings.currency);
  const int = (n: number) => Math.round(n).toLocaleString();
  const oneDecimal = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const sections: Section[] = [
    {
      title: "Money",
      items: [
        { label: "Total spent", value: stats.totalSpent, money: true },
        { label: "This month", value: stats.spentThisMonth, money: true },
        { label: "Last month", value: stats.spentLastMonth, money: true },
        { label: "This year", value: stats.spentThisYear, money: true },
        { label: "Average weekly", value: stats.averageWeeklySpend, money: true },
        { label: "Average monthly", value: stats.averageMonthlySpend, money: true },
      ],
    },
    {
      title: "Packs",
      items: [
        { label: "Total packs", value: stats.totalPacks },
        { label: "This month", value: stats.packsThisMonth },
        { label: "Longest gap", value: stats.longestGapDays, suffix: " days" },
        { label: "Avg days per pack", value: stats.averageDaysPerPack, decimals: 1 },
      ],
    },
    {
      title: "Cigarettes",
      items: [{ label: "Total cigarettes", value: stats.totalCigarettes }],
    },
    {
      title: "Forecast",
      items: [
        { label: "Projected yearly spend", value: stats.forecastYearlySpend, money: true },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-[max(3.5rem,env(safe-area-inset-top))] pb-32">
      <h1 className="px-4 text-[34px] font-bold tracking-tight">Statistics</h1>
      {purchases.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-[17px] font-semibold">No packs logged yet</p>
          <p className="mt-1 text-[15px] text-label-secondary">
            Stats appear after your first purchase.
          </p>
        </div>
      ) : (
        <motion.div variants={container} initial="initial" animate="animate" className="mt-4 space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="px-4 pb-2 text-[13px] font-semibold tracking-[0.06em] text-label-secondary uppercase">
                {section.title}
              </h2>
              <div className="overflow-hidden rounded-[16px] bg-card">
                {section.items.map((item, i) => (
                  <motion.div
                    key={item.label}
                    variants={rise}
                    className={`flex min-h-[52px] items-center justify-between px-4 py-3 ${
                      i > 0
                        ? "relative before:absolute before:top-0 before:right-0 before:left-4 before:h-px before:bg-separator"
                        : ""
                    }`}
                  >
                    <span className="text-[17px]">{item.label}</span>
                    <AnimatedNumber
                      value={item.value}
                      cacheKey={`${section.title}:${item.label}`}
                      format={(n) => {
                        const base = item.money
                          ? money(n)
                          : item.decimals === 1
                            ? oneDecimal(n)
                            : int(n);
                        return item.suffix ? `${base}${item.suffix}` : base;
                      }}
                      className="text-[17px] font-semibold"
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
          <p className="px-4 text-[13px] text-label-tertiary">
            Cigarette count is packs × pack size. Forecast projects your last 30 days of
            spending across a year.
          </p>
        </motion.div>
      )}
    </div>
  );
}
