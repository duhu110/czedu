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

function createUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month, day));
}

function getShanghaiCalendarParts(now: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
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
      start: createUtcDate(year - 1, 8, 1),
      end: createUtcDate(year, 2, 1),
    };
  }

  return {
    start: createUtcDate(year, 2, 1),
    end: createUtcDate(year, 8, 1),
  };
}

export function getDefaultSemesterFormValues(
  now = new Date(),
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

export function getYearOptions(currentYear = getShanghaiCalendarParts(new Date()).year) {
  return Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);
}

export function inferSemesterFormValues(
  semester: SemesterLike,
): SemesterFormValues {
  const isSpring = semester.startDate.getUTCFullYear() !== semester.endDate.getUTCFullYear();
  const term: SemesterTerm = isSpring ? "春季" : "秋季";
  const year = isSpring
    ? semester.endDate.getUTCFullYear()
    : semester.startDate.getUTCFullYear();

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
  now = new Date(),
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
  now = new Date(),
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
