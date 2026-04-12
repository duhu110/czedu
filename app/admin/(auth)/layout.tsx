// app/admin/(auth)/layout.tsx
import { redirect } from "next/navigation";

import { requireCurrentAdmin } from "@/lib/admin-session";
import {
  getAdminSemesters,
  getStoredAdminSelectedSemesterId,
} from "@/lib/admin-selected-semester";
import { SemesterProvider } from "@/lib/semester-context";
import { AppNavbar } from "@/components/admin/app-navbar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let currentAdmin: Awaited<ReturnType<typeof requireCurrentAdmin>> | null =
    null;
  let semesters: Awaited<ReturnType<typeof getAdminSemesters>> = [];
  let initialSelectedSemesterId: string | undefined;

  try {
    [currentAdmin, semesters, initialSelectedSemesterId] = await Promise.all([
      requireCurrentAdmin(),
      getAdminSemesters(),
      getStoredAdminSelectedSemesterId(),
    ]);
  } catch (e) {
    console.error("Auth Layout Error:", e);
    redirect("/admin/login");
  }

  return (
    <SidebarProvider>
      <SemesterProvider
        semesters={semesters}
        initialSelectedSemesterId={initialSelectedSemesterId}
      >
        <AppSidebar currentAdmin={currentAdmin} />
        <SidebarInset className="h-screen overflow-hidden p-4 md:p-6">
          <div className="flex h-full flex-col overflow-hidden">
            <AppNavbar user={currentAdmin} />
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </SidebarInset>
      </SemesterProvider>
    </SidebarProvider>
  );
}
