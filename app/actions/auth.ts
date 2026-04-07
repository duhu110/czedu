"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

// 1. 导出接口，方便前端直接使用：import { type ActionState } ...
export interface ActionState {
  error: string | null;
  success: boolean;
}

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "6B4LGoNHcW553UjKgKkJ/rvdoNOPv8OSazQg3OCOlRU=",
);

export async function loginAction(data: LoginInput): Promise<ActionState> {
  // 1. Zod 验证输入格式
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "输入格式有误" };
  }

  const { username, password } = parsed.data;

  try {
    // 2. 查数据库
    const admin = await prisma.admin.findUnique({ where: { username } });
    // 出于安全考虑，不告知是账号不存在还是密码错误
    if (!admin) {
      return { success: false, error: "用户名或密码错误" };
    }

    // 3. 校验密码
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return { success: false, error: "用户名或密码错误" };
    }

    // 4. 账号状态检查
    if (!admin.isActive) {
      return { success: false, error: "账号已被禁用，请联系系统管理员" };
    }

    // 5. 生成 JWT Token
    const token = await new SignJWT({
      adminId: admin.id,
      username: admin.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(SECRET_KEY);

    // 6. 写入 HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1天
    });

    // 成功时 error 为 null
    return { success: true, error: null };
  } catch (e) {
    console.error("Login Action Error:", e);
    return { success: false, error: "服务器内部错误，请稍后再试" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();

  // 1. 删除 Cookie
  cookieStore.delete("admin_token");

  // 2. 重定向到登录页
  redirect("/admin/login");
}
