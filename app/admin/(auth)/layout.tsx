// app/admin/(auth)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AppNavbar } from "@/components/admin/app-navbar";
import { SemesterProvider } from "@/lib/semester-context";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. 定义一个变量来承载数据
  let currentAdmin = null;
  let semesters = []; // 1. 这里定义了变量

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) throw new Error("No token");

    // 解析 JWT
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const adminId = payload.adminId as string;

    // 查库
    currentAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { username: true, name: true },
    });

    if (!currentAdmin) throw new Error("Admin not found");

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
        <AppSidebar />
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
