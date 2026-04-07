"use server";

import prisma from "@/lib/prisma";
import {
  semesterFormSchema,
  semesterWindowErrorMessage,
  toSemesterMutationInput,
  type SemesterFormInput,
} from "@/lib/validations/semester";
import { revalidatePath } from "next/cache";

const semestersRevalidationPaths = ["/admin/semesters", "/admin"] as const;

function revalidateSemesterPaths() {
  for (const path of semestersRevalidationPaths) {
    revalidatePath(path);
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  const code = typeof error === "object" && error !== null ? Reflect.get(error, "code") : undefined;
  const message = typeof error === "object" && error !== null ? Reflect.get(error, "message") : "";

  if (code === "P2002") {
    return "该学期已存在";
  }

  if (code === "P2003" || code === "P2014" || /foreign key|relation/i.test(String(message))) {
    return "该学期存在关联数据，无法删除";
  }

  return fallback;
}

function getValidationErrorMessage(values: SemesterFormInput) {
  const parsed = semesterFormSchema.safeParse(values);
  if (parsed.success) {
    return null;
  }

  return parsed.error.issues[0]?.message ?? semesterWindowErrorMessage;
}

export async function getSemesters() {
  return await prisma.semester.findMany({
    orderBy: { startDate: "desc" },
  });
}

export async function createSemester(values: SemesterFormInput) {
  const validationError = getValidationErrorMessage(values);
  if (validationError) {
    return { error: validationError };
  }

  try {
    const data = toSemesterMutationInput(values);
    await prisma.semester.create({ data });
    revalidateSemesterPaths();
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error, "创建失败，请稍后再试") };
  }
}

export async function updateSemester(id: string, values: SemesterFormInput) {
  const validationError = getValidationErrorMessage(values);
  if (validationError) {
    return { error: validationError };
  }

  try {
    const data = toSemesterMutationInput(values);
    await prisma.semester.update({
      where: { id },
      data,
    });
    revalidateSemesterPaths();
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error, "更新失败，请稍后再试") };
  }
}

export async function toggleSemesterActive(id: string, isActive: boolean) {
  try {
    await prisma.semester.update({
      where: { id },
      data: { isActive },
    });
    revalidateSemesterPaths();
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error, "更新失败，请稍后再试") };
  }
}

export async function deleteSemester(id: string) {
  try {
    await prisma.semester.delete({ where: { id } });
    revalidateSemesterPaths();
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error, "删除失败，请稍后再试") };
  }
}
