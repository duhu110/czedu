import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppNavbar } from "@/components/admin/app-navbar";
import { AppSidebar } from "@/components/admin/app-sidebar";

export default function AdminAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-4 md:p-6">
        <AppNavbar />
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
