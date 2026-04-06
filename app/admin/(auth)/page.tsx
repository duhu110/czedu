import { ApplicationOverviewCards } from "@/components/admin/application-overview-cards";
import { ApplicationTable } from "@/components/admin/application-table";
import { ApplicationTrendChart } from "@/components/admin/application-trend-chart";
import { transferApplications } from "@/lib/admin/mock-transfer-applications";

export default function AdminDashboardPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <ApplicationOverviewCards />
      <div className="px-4 lg:px-6">
        <ApplicationTrendChart />
      </div>
      <ApplicationTable
        data={transferApplications.slice(0, 10)}
        title="最新申请预览"
      />
    </div>
  );
}
