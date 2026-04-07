import { z } from "zod";

import { buildSemesterName, getSemesterWindow, type SemesterTerm } from "@/lib/semester";

export const semesterWindowErrorMessage = "学期日期超出允许范围";

export const semesterFormSchema = z
  .object({
    year: z.number().int("学年必须是整数"),
    term: z.enum(["春季", "秋季"]),
    startDate: z.date({
      required_error: "请选择开始日期",
    } as z.RawCreateParams),
    endDate: z.date({
      required_error: "请选择结束日期",
    } as z.RawCreateParams),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.endDate < values.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "结束日期不能早于开始日期",
      });
    }

    const window = getSemesterWindow(values.year, values.term);

    if (values.startDate < window.start || values.startDate > window.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: semesterWindowErrorMessage,
      });
    }

    if (values.endDate < window.start || values.endDate > window.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: semesterWindowErrorMessage,
      });
    }
  });

export const semesterMutationSchema = z.object({
  name: z.string().min(2, "学期名称至少2个字符"),
  startDate: z.date({
    required_error: "请选择开始日期",
  } as z.RawCreateParams),
  endDate: z.date({
    required_error: "请选择结束日期",
  } as z.RawCreateParams),
  isActive: z.boolean(),
});

export type SemesterFormInput = z.infer<typeof semesterFormSchema>;
export type SemesterMutationInput = z.infer<typeof semesterMutationSchema>;

export function toSemesterMutationInput(values: SemesterFormInput): SemesterMutationInput {
  return semesterMutationSchema.parse({
    name: buildSemesterName(values.year, values.term as SemesterTerm),
    startDate: values.startDate,
    endDate: values.endDate,
    isActive: values.isActive,
  });
}
