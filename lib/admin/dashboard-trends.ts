export type TrendRange = "7d" | "30d" | "90d";

const trendRows = [
  { date: "2026-01-10", applications: 4, completed: 2 },
  { date: "2026-01-20", applications: 6, completed: 3 },
  { date: "2026-02-01", applications: 5, completed: 4 },
  { date: "2026-02-12", applications: 8, completed: 5 },
  { date: "2026-02-25", applications: 7, completed: 4 },
  { date: "2026-03-05", applications: 9, completed: 6 },
  { date: "2026-03-12", applications: 11, completed: 7 },
  { date: "2026-03-19", applications: 10, completed: 8 },
  { date: "2026-03-26", applications: 12, completed: 9 },
  { date: "2026-04-01", applications: 7, completed: 5 },
  { date: "2026-04-03", applications: 6, completed: 4 },
  { date: "2026-04-05", applications: 8, completed: 6 },
];

export function getDashboardTrendTotals(range: TrendRange) {
  if (range === "7d") {
    return trendRows.slice(-3);
  }

  if (range === "30d") {
    return trendRows.slice(-6);
  }

  return trendRows;
}
