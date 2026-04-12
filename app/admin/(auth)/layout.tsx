// app/admin/(auth)/layout.tsx
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireCurrentAdmin } from "@/lib/admin-session";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AppNavbar } from "@/components/admin/app-navbar";
import { SemesterProvider } from "@/lib/semester-context";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. 定义一个变量来承载数据
  let currentAdmin: Awaited<ReturnType<typeof requireCurrentAdmin>> | null =
    null;
  let semesters: Awaited<ReturnType<typeof prisma.semester.findMany>> = [];

  try {
    currentAdmin = await requireCurrentAdmin();

    // 2. 关键修复：去掉 const！直接赋值给外层变量
    semesters = await prisma.semester.findMany({
      orderBy: { startDate: "desc" },
    });
  } catch (e) {
    // 捕获到任何错误（Token无效、过期、库连接失败）统一重定向
    console.error("Auth Layout Error:", e);
    redirect("/admin/login");
  }

  // 2. 在 try/catch 外部进行渲染
  // 此时 currentAdmin 一定是有值的，否则在上面就被 redirect 拦截了
  return (
    <SidebarProvider>
      <SemesterProvider semesters={semesters}>
        <AppSidebar currentAdmin={currentAdmin} />
        <SidebarInset className="h-screen overflow-hidden p-4 md:p-6">
          <div className="flex h-full flex-col overflow-hidden">
            {/* 将数据传给组件 */}
            <AppNavbar user={currentAdmin} />
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </SidebarInset>
      </SemesterProvider>
    </SidebarProvider>
  );
}
