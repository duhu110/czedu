import { requireSuperAdminPage } from "@/lib/admin-session";
import { listAdminUsers } from "@/app/actions/admin";
import { AdminUserManager } from "./_components/admin-user-manager";

export default async function AdminUsersPage() {
  await requireSuperAdminPage();
  const result = await listAdminUsers();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          维护后台管理员账号，配置账号启用状态和超级管理员权限。
        </p>
      </div>
      <AdminUserManager admins={result.data ?? []} />
    </div>
  );
}
