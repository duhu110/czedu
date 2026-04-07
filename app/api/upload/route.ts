// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "没有找到文件" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. 生成唯一文件名 (时间戳 + 随机数 + 原后缀)
    const originalExt = file.name.split(".").pop();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000)}.${originalExt}`;

    // 2. 确保上传目录存在
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 3. 写入文件
    const filePath = join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // 4. 返回可访问的 URL
    return NextResponse.json({
      success: true,
      url: `/uploads/${uniqueName}`,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "文件上传失败" }, { status: 500 });
  }
}
