"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  parseDistrictRangeText,
  schoolFormSchema,
  type SchoolFormInput,
} from "@/lib/validations/school";

type SchoolRecord = {
  id: string;
  name: string;
  districtRange: string[];
  address: string;
  notice: string;
};

const schoolRevalidationPaths = [
  "/admin/schools",
  "/admin/applications",
  "/admin/applications/[id]",
  "/application/confirmation/[id]",
] as const;

function revalidateSchoolPaths() {
  for (const path of schoolRevalidationPaths) {
    if (path.includes("[id]")) {
      revalidatePath(path, "page");
    } else {
      revalidatePath(path);
    }
  }
}

function getSchoolUniqueConflictMessage(error: unknown) {
  const code =
    typeof error === "object" && error !== null ? Reflect.get(error, "code") : undefined;

  if (code === "P2002") {
    return "学校名称已存在";
  }

  return null;
}

function getSchoolDeleteErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error !== null ? Reflect.get(error, "code") : undefined;
  const message =
    typeof error === "object" && error !== null ? Reflect.get(error, "message") : "";

  if (code === "P2003" || code === "P2014" || /foreign key|relation/i.test(String(message))) {
    return "该学校存在关联数据，无法删除";
  }

  return "删除学校失败";
}

function serializeSchoolForm(values: SchoolFormInput) {
  const districtRange = parseDistrictRangeText(values.districtRangeText);

  return {
    name: values.name.trim(),
    districtRange: JSON.stringify(districtRange),
    address: values.address.trim(),
    notice: values.notice.trim(),
  };
}

function parseDistrictRange(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function deserializeSchool(record: {
  id: string;
  name: string;
  districtRange: string;
  address: string;
  notice: string;
}): SchoolRecord {
  return {
    id: record.id,
    name: record.name,
    districtRange: parseDistrictRange(record.districtRange),
    address: record.address,
    notice: record.notice,
  };
}

export async function getSchools() {
  try {
    const records = await prisma.school.findMany({
      orderBy: { id: "asc" },
    });

    return {
      success: true,
      error: null,
      data: records.map(deserializeSchool),
    };
  } catch (error) {
    console.error("Get Schools Error:", error);
    return {
      success: false,
      error: "获取学校列表失败",
      data: [] as SchoolRecord[],
    };
  }
}

export async function getSchoolByName(name: string) {
  try {
    const record = await prisma.school.findUnique({
      where: { name },
    });

    return {
      success: true,
      error: null,
      data: record ? deserializeSchool(record) : null,
    };
  } catch (error) {
    console.error("Get School By Name Error:", error);
    return {
      success: false,
      error: "获取学校信息失败",
      data: null as SchoolRecord | null,
    };
  }
}

export async function createSchool(values: SchoolFormInput) {
  const parsed = schoolFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "学校数据校验失败",
    };
  }

  try {
    await prisma.school.create({
      data: serializeSchoolForm(parsed.data),
    });
    revalidateSchoolPaths();
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: getSchoolUniqueConflictMessage(error) ?? "创建学校失败",
    };
  }
}

export async function updateSchool(id: string, values: SchoolFormInput) {
  const parsed = schoolFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "学校数据校验失败",
    };
  }

  try {
    await prisma.school.update({
      where: { id },
      data: serializeSchoolForm(parsed.data),
    });
    revalidateSchoolPaths();
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: getSchoolUniqueConflictMessage(error) ?? "更新学校失败",
    };
  }
}

export async function deleteSchool(id: string) {
  try {
    await prisma.school.delete({
      where: { id },
    });
    revalidateSchoolPaths();
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: getSchoolDeleteErrorMessage(error),
    };
  }
}
