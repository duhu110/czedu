import { cache } from "react";
import { cookies } from "next/headers";

import prisma from "@/lib/prisma";
import { pickPreferredSemester } from "@/lib/semester";

export const ADMIN_SELECTED_SEMESTER_COOKIE = "admin-selected-semester-id";

export const getAdminSemesters = cache(async () => {
  return prisma.semester.findMany({
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      isActive: true,
    },
  });
});

export const getStoredAdminSelectedSemesterId = cache(async () => {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SELECTED_SEMESTER_COOKIE)?.value;
});

export async function getAdminSelectedSemester() {
  const [semesters, selectedSemesterId] = await Promise.all([
    getAdminSemesters(),
    getStoredAdminSelectedSemesterId(),
  ]);

  return pickPreferredSemester(semesters, selectedSemesterId) ?? null;
}
