import { z } from "zod";

const requiredTrimmedString = z
  .string()
  .trim()
  .min(1, "请填写必填内容");

export const schoolFormSchema = z.object({
  name: requiredTrimmedString,
  districtRangeText: requiredTrimmedString,
  address: z.string().trim().default(""),
  notice: z.string().trim().default(""),
});

export type SchoolFormInput = z.infer<typeof schoolFormSchema>;

export function parseDistrictRangeText(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatDistrictRangeText(value: string[]) {
  return value.join("\n");
}
