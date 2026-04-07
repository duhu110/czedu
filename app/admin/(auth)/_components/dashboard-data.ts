import type { ApplicationStatus } from "@prisma/client";

export type DashboardRange = "7d" | "30d" | "90d";

const RANGE_DAYS: Record<DashboardRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const terminalStatuses = new Set<ApplicationStatus>(["APPROVED", "REJECTED"]);

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const labelFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  month: "2-digit",
  day: "2-digit",
});

function toDateKey(date: Date) {
  return keyFormatter.format(date);
}

function toDateLabel(date: Date) {
  return labelFormatter.format(date);
}

export function buildDashboardStats(
  applications: Array<{ status: ApplicationStatus }>,
) {
  return applications.reduce(
    (stats, application) => {
      stats.total += 1;

      if (application.status === "PENDING") {
        stats.pending += 1;
      }

      if (application.status === "SUPPLEMENT") {
        stats.supplementRequired += 1;
      }

      if (application.status === "APPROVED") {
        stats.approved += 1;
      }

      return stats;
    },
    {
      total: 0,
      pending: 0,
      supplementRequired: 0,
      approved: 0,
    },
  );
}

export function buildTrendSeries(
  applications: Array<{
    status: ApplicationStatus;
    createdAt: Date;
    updatedAt: Date;
  }>,
  now = new Date(),
) {
  const createdCountByDay = new Map<string, number>();
  const completedCountByDay = new Map<string, number>();

  for (const application of applications) {
    const createdKey = toDateKey(application.createdAt);
    createdCountByDay.set(
      createdKey,
      (createdCountByDay.get(createdKey) ?? 0) + 1,
    );

    if (terminalStatuses.has(application.status)) {
      const completedKey = toDateKey(application.updatedAt);
      completedCountByDay.set(
        completedKey,
        (completedCountByDay.get(completedKey) ?? 0) + 1,
      );
    }
  }

  const series = {} as Record<
    DashboardRange,
    Array<{
      date: string;
      label: string;
      applications: number;
      completed: number;
    }>
  >;

  for (const range of Object.keys(RANGE_DAYS) as DashboardRange[]) {
    const rows = [];
    const days = RANGE_DAYS[range];

    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - offset);

      const key = toDateKey(date);
      rows.push({
        date: key,
        label: toDateLabel(date),
        applications: createdCountByDay.get(key) ?? 0,
        completed: completedCountByDay.get(key) ?? 0,
      });
    }

    series[range] = rows;
  }

  return series;
}
