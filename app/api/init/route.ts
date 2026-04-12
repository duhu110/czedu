// app/api/init/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. 检查是否已经存在管理员，防止重复初始化
    const adminCount = await prisma.admin.count();

    if (adminCount > 0) {
      return NextResponse.json(
        {
          message: "管理员已存在，无需重复初始化。",
        },
        { status: 400 },
      );
    }

    // 2. 准备初始账号密码（这里默认设为 admin / 123456）
    const defaultUsername = "admin";
    const defaultPassword = "123456";

    // 3. 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // 4. 写入数据库
    const admin = await prisma.admin.create({
      data: {
        username: defaultUsername,
        password: hashedPassword,
        name: "超级管理员", // 可选字段
        isSuperAdmin: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "初始管理员创建成功！",
      data: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("初始化管理员失败:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
