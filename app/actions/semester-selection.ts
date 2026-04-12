"use server";

import { cookies } from "next/headers";

import { ADMIN_SELECTED_SEMESTER_COOKIE } from "@/lib/admin-selected-semester";

export async function persistSelectedSemesterId(semesterId?: string) {
  const cookieStore = await cookies();
  const nextSemesterId = semesterId?.trim();

  if (!nextSemesterId) {
    cookieStore.delete(ADMIN_SELECTED_SEMESTER_COOKIE);
    return { success: true };
  }

  cookieStore.set(ADMIN_SELECTED_SEMESTER_COOKIE, nextSemesterId, {
    path: "/",
    sameSite: "lax",
  });

  return { success: true };
}
