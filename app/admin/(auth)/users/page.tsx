import { ApplicationTable } from "@/components/admin/application-table";
import { transferApplications } from "@/lib/admin/mock-transfer-applications";

export default function AdminUsersPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <ApplicationTable data={transferApplications} />
    </div>
  );
}
