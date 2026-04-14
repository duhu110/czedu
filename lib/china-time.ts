export const BEIJING_TIME_ZONE = "Asia/Shanghai";

export function ensureBeijingTimeZone() {
  if (typeof process !== "undefined" && process.env) {
    process.env.TZ = BEIJING_TIME_ZONE;
  }
}

ensureBeijingTimeZone();

type DateLike = Date | string | number;

type BeijingDateTimeParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BEIJING_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  hourCycle: "h23",
});

function toDate(value: DateLike) {
  return value instanceof Date ? value : new Date(value);
}

function getBeijingParts(value: DateLike): BeijingDateTimeParts {
  const parts = dateTimeFormatter.formatToParts(toDate(value));
  const partMap = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    year: partMap.year,
    month: partMap.month,
    day: partMap.day,
    hour: partMap.hour,
    minute: partMap.minute,
    second: partMap.second,
  };
}

export function getBeijingNow() {
  return new Date();
}

export function formatBeijingDate(value: DateLike) {
  const parts = getBeijingParts(value);

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatBeijingTime(value: DateLike, options?: { seconds?: boolean }) {
  const parts = getBeijingParts(value);
  const time = `${parts.hour}:${parts.minute}`;

  return options?.seconds === false ? time : `${time}:${parts.second}`;
}

export function formatBeijingDateTime(
  value: DateLike,
  options?: { seconds?: boolean },
) {
  return `${formatBeijingDate(value)} ${formatBeijingTime(value, {
    seconds: options?.seconds ?? false,
  })}`;
}

export function toBeijingDateInputValue(value?: DateLike | null) {
  if (!value) {
    return "";
  }

  const date = toDate(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return formatBeijingDate(date);
}

export function parseBeijingDateInputValue(value: string) {
  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00+08:00`);

  return Number.isNaN(parsed.getTime()) ||
    toBeijingDateInputValue(parsed) !== value
    ? null
    : parsed;
}
