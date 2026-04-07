// lib/validations/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(6, "密码不能少于6位"),
});

// 直接推导出 TypeScript Type 供前端使用
export type LoginInput = z.infer<typeof loginSchema>;
