import {
  BEIJING_TIME_ZONE,
  getBeijingNow,
  parseBeijingDateInputValue,
  toBeijingDateInputValue,
} from "@/lib/china-time";

export type SemesterTerm = "春季" | "秋季";
export type SemesterTimelineStatus = "未开始" | "进行中" | "已结束";

export interface SemesterWindow {
  start: Date;
  end: Date;
}

export interface SemesterLike {
  id?: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface SemesterFormValues {
  year: number;
  term: SemesterTerm;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

function createBeijingDate(year: number, month: number, day: number) {
  const value = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const date = parseBeijingDateInputValue(value);

  if (!date) {
    throw new Error(`Invalid Beijing date: ${value}`);
  }

  return date;
}

function getShanghaiCalendarParts(now: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: BEIJING_TIME_ZONE,
    year: "numeric",
    month: "numeric",
  });
  const parts = formatter.formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value) - 1;

  return { year, month };
}

export function buildSemesterName(year: number, term: SemesterTerm) {
  return `${year}年${term}`;
}

export function getSemesterWindow(year: number, term: SemesterTerm): SemesterWindow {
  if (term === "春季") {
    return {
      start: createBeijingDate(year - 1, 8, 1),
      end: createBeijingDate(year, 2, 1),
    };
  }

  return {
    start: createBeijingDate(year, 2, 1),
    end: createBeijingDate(year, 8, 1),
  };
}

export function getDefaultSemesterFormValues(
  now = getBeijingNow(),
): SemesterFormValues {
  const { year: currentYear, month: currentMonth } = getShanghaiCalendarParts(now);
  const term: SemesterTerm = currentMonth >= 2 && currentMonth < 8 ? "秋季" : "春季";
  const year =
    term === "秋季" ? currentYear : currentMonth >= 8 ? currentYear + 1 : currentYear;
  const window = getSemesterWindow(year, term);

  return {
    year,
    term,
    startDate: window.start,
    endDate: window.end,
    isActive: true,
  };
}

export function getYearOptions(currentYear = getShanghaiCalendarParts(getBeijingNow()).year) {
  return Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);
}

export function inferSemesterFormValues(
  semester: SemesterLike,
): SemesterFormValues {
  const startYear = Number(toBeijingDateInputValue(semester.startDate).slice(0, 4));
  const endYear = Number(toBeijingDateInputValue(semester.endDate).slice(0, 4));
  const isSpring = startYear !== endYear;
  const term: SemesterTerm = isSpring ? "春季" : "秋季";
  const year = isSpring ? endYear : startYear;

  return {
    year,
    term,
    startDate: semester.startDate,
    endDate: semester.endDate,
    isActive: semester.isActive,
  };
}

export function getSemesterTimelineStatus(
  semester: Pick<SemesterLike, "startDate" | "endDate">,
  now = getBeijingNow(),
): SemesterTimelineStatus {
  if (now < semester.startDate) {
    return "未开始";
  }

  if (now >= semester.endDate) {
    return "已结束";
  }

  return "进行中";
}

export function pickPreferredSemester<T extends Pick<SemesterLike, "id" | "startDate" | "endDate">>(
  semesters: T[] | undefined,
  selectedId?: string,
  now = getBeijingNow(),
) {
  const safeSemesters = semesters ?? [];
  const selected = selectedId
    ? safeSemesters.find((semester) => semester.id === selectedId)
    : undefined;

  if (selected) {
    return selected;
  }

  return (
    safeSemesters.find(
      (semester) => now >= semester.startDate && now < semester.endDate,
    ) ?? safeSemesters[0] ?? null
  );
}
