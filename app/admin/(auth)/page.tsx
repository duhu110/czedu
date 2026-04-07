import Link from "next/link";
import { CircleOffIcon } from "lucide-react";

import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { DashboardApplicationTable } from "./_components/dashboard-application-table";
import { buildDashboardStats, buildTrendSeries } from "./_components/dashboard-data";
import { DashboardOverviewCards } from "./_components/dashboard-overview-cards";
import { DashboardTrendChart } from "./_components/dashboard-trend-chart";

export default async function AdminDashboardPage() {
  const activeSemester = await prisma.semester.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!activeSemester) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 lg:p-6">
        <Empty className="max-w-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CircleOffIcon />
            </EmptyMedia>
            <EmptyTitle>当前没有启用学期</EmptyTitle>
            <EmptyDescription>
              后台首页依赖启用中的学期来展示当前申请统计。请先在学期管理中启用一个学期。
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/admin/semesters">前往学期管理</Link>
          </Button>
        </Empty>
      </div>
    );
  }

  const applications = await prisma.application.findMany({
    where: { semesterId: activeSemester.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      studentId: true,
      currentSchool: true,
      targetGrade: true,
      targetSchool: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const stats = buildDashboardStats(applications);
  const series = buildTrendSeries(applications);

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">后台总览</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          当前启用学期：{activeSemester.name}，申请时间范围{" "}
          {activeSemester.startDate.toLocaleDateString("zh-CN")} 至{" "}
          {activeSemester.endDate.toLocaleDateString("zh-CN")}
        </p>
      </div>

      <DashboardOverviewCards semesterName={activeSemester.name} stats={stats} />

      <div className="px-4 lg:px-6">
        <DashboardTrendChart
          hasApplications={applications.length > 0}
          series={series}
        />
      </div>

      <DashboardApplicationTable applications={applications.slice(0, 10)} />
    </div>
  );
}
