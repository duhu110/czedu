import { z } from "zod";

const optionalTrimmedString = z.preprocess(
  (value) =>
    typeof value === "string" ? (value.trim() || undefined) : value,
  z.string().optional(),
);

const usernameSchema = z
  .string()
  .min(3, "用户名至少需要 3 个字符")
  .max(30, "用户名不能超过 30 个字符")
  .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线");

export const createAdminUserSchema = z.object({
  username: usernameSchema,
  password: z.string().min(6, "密码不能少于 6 位"),
  name: optionalTrimmedString,
  isActive: z.boolean(),
  isSuperAdmin: z.boolean(),
});

export const updateAdminUserSchema = z.object({
  name: optionalTrimmedString,
  password: z.string().optional(),
  isActive: z.boolean(),
  isSuperAdmin: z.boolean(),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
