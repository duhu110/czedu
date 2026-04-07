// lib/validations/semester.ts
import * as z from "zod";

export const semesterSchema = z.object({
  name: z.string().min(2, "学期名称至少2个字符"),
  // 如果直接传对象报错，先定义为 z.date()，然后用 .error() 或者通过第二个参数处理
  startDate: z.date({
    required_error: "请选择开始日期",
  } as z.RawCreateParams), // 强制断言解决某些版本的类型歧义

  endDate: z.date({
    required_error: "请选择结束日期",
  } as z.RawCreateParams),

  isActive: z.boolean().default(false),
});

export type SemesterInput = z.infer<typeof semesterSchema>;
