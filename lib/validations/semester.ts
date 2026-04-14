import { z } from "zod";

import { BEIJING_TIME_ZONE } from "@/lib/china-time";
import { buildSemesterName, getSemesterWindow, type SemesterTerm } from "@/lib/semester";

export const semesterWindowErrorMessage = "学期日期超出允许范围";

const shanghaiDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BEIJING_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getShanghaiBusinessDayKey(date: Date) {
  const parts = shanghaiDateFormatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value) - 1;
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return Date.UTC(year, month, day);
}

export const semesterFormSchema = z
  .object({
    year: z.number().int("学年必须是整数"),
    term: z.enum(["春季", "秋季"]),
    startDate: z.date({ error: "请选择开始日期" }),
    endDate: z.date({ error: "请选择结束日期" }),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const startDateKey = getShanghaiBusinessDayKey(values.startDate);
    const endDateKey = getShanghaiBusinessDayKey(values.endDate);
    const window = getSemesterWindow(values.year, values.term);
    const windowStartKey = getShanghaiBusinessDayKey(window.start);
    const windowEndKey = getShanghaiBusinessDayKey(window.end);

    if (endDateKey < startDateKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "结束日期不能早于开始日期",
      });
    }

    if (startDateKey < windowStartKey || startDateKey > windowEndKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: semesterWindowErrorMessage,
      });
    }

    if (endDateKey < windowStartKey || endDateKey > windowEndKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: semesterWindowErrorMessage,
      });
    }
  });

export const semesterMutationSchema = z.object({
  name: z.string().min(2, "学期名称至少2个字符"),
  startDate: z.date({ error: "请选择开始日期" }),
  endDate: z.date({ error: "请选择结束日期" }),
  isActive: z.boolean(),
});

export type SemesterFormInput = z.infer<typeof semesterFormSchema>;
export type SemesterMutationInput = z.infer<typeof semesterMutationSchema>;
export const semesterSchema = semesterMutationSchema;
export type SemesterInput = SemesterMutationInput;
export type SemesterCreateInput = SemesterFormInput | SemesterInput;

export function toSemesterMutationInput(values: SemesterFormInput): SemesterMutationInput {
  return semesterMutationSchema.parse({
    name: buildSemesterName(values.year, values.term as SemesterTerm),
    startDate: values.startDate,
    endDate: values.endDate,
    isActive: values.isActive,
  });
}
