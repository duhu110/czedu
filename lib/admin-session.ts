import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

import prisma from "@/lib/prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "6B4LGoNHcW553UjKgKkJ/rvdoNOPv8OSazQg3OCOlRU=",
);

export type AdminSession = {
  id: string;
  username: string;
  name: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
};

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const adminId = payload.adminId;

    if (typeof adminId !== "string" || !adminId) {
      return null;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        name: true,
        isSuperAdmin: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      return null;
    }

    return admin;
  } catch (error) {
    console.error("Get Current Admin Error:", error);
    return null;
  }
}

export async function requireCurrentAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function requireSuperAdminPage() {
  const admin = await requireCurrentAdmin();

  if (!admin.isSuperAdmin) {
    redirect("/admin");
  }

  return admin;
}
