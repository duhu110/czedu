import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppNavbar } from "@/components/admin/app-navbar";
import { AppSidebar } from "@/components/admin/app-sidebar";

export default function AdminAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminAuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-screen overflow-hidden p-4 md:p-6">
          <div className="flex h-full flex-col overflow-hidden">
            <AppNavbar />
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminAuthGuard>
  );
}
