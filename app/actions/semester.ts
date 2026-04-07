"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { semesterSchema, type SemesterInput } from "@/lib/validations/semester";

export async function getSemesters() {
  return await prisma.semester.findMany({
    orderBy: { startDate: "desc" },
  });
}

export async function createSemester(data: SemesterInput) {
  const parsed = semesterSchema.safeParse(data);
  if (!parsed.success) return { error: "输入数据非法" };

  try {
    await prisma.semester.create({
      data: parsed.data,
    });
    // 强制刷新相关页面数据
    revalidatePath("/admin/semesters");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error("创建学期失败:", e);
    return { error: "创建失败，请稍后再试" };
  }
}

export async function deleteSemester(id: string) {
  await prisma.semester.delete({ where: { id } });
  revalidatePath("/admin/semesters");
}
