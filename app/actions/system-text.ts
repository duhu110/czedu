"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  systemTextFormSchema,
  type SystemTextFormInput,
} from "@/lib/validations/system-text";
import type { SystemTextType } from "@prisma/client";

const revalidationPaths = ["/admin/system-texts", "/admin"] as const;

function revalidateSystemTextPaths() {
  for (const path of revalidationPaths) {
    revalidatePath(path);
  }
}

export async function getSystemTexts(semesterId: string) {
  try {
    const records = await prisma.systemText.findMany({
      where: { semesterId },
      orderBy: { type: "asc" },
    });
    return { success: true, data: records, error: null };
  } catch (e) {
    console.error("Get SystemTexts Error:", e);
    return { success: false, data: [], error: "获取数据失败" };
  }
}

export async function getSystemTextByType(
  semesterId: string,
  type: SystemTextType,
) {
  try {
    const record = await prisma.systemText.findUnique({
      where: { semesterId_type: { semesterId, type } },
    });
    return { success: true, data: record, error: null };
  } catch (e) {
    console.error("Get SystemText Error:", e);
    return { success: false, data: null, error: "获取数据失败" };
  }
}

export async function upsertSystemText(data: SystemTextFormInput) {
  try {
    const parsed = systemTextFormSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "输入数据非法" };
    }

    const { semesterId, type, content } = parsed.data;

    await prisma.systemText.upsert({
      where: { semesterId_type: { semesterId, type } },
      create: { semesterId, type, content },
      update: { content },
    });

    revalidateSystemTextPaths();
    return { success: true, error: null };
  } catch (e) {
    console.error("Upsert SystemText Error:", e);
    return { success: false, error: "保存失败，请稍后再试" };
  }
}
