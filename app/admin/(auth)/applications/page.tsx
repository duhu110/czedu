import Link from "next/link";
import { type ApplicationStatus } from "@prisma/client";

import { getApplications } from "@/app/actions/application";
import { getAdminSelectedSemester } from "@/lib/admin-selected-semester";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApplicationFilters } from "./_components/application-filters";
import { ApplicationImportExportToolbar } from "./_components/application-import-export-toolbar";
import { ApplicationPagination } from "./_components/application-pagination";
import { formatBeijingDate } from "@/lib/china-time";
import { PROPERTY_TYPE_LABELS } from "@/lib/validations/application";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

const statusMap: Record<
  ApplicationStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "待审核", variant: "secondary" },
  APPROVED: { label: "已通过", variant: "default" },
  REJECTED: { label: "已驳回", variant: "destructive" },
  SUPPLEMENT: { label: "待补学籍信息卡", variant: "outline" },
  EDITING: { label: "待修改", variant: "outline" },
};

export default async function AdminApplicationsPage({
  searchParams,
}: PageProps) {
  const [params, selectedSemester] = await Promise.all([
    searchParams,
    getAdminSelectedSemester(),
  ]);
  const currentPage = Number(params.page) || 1;

  const { data: applications = [], meta } = await getApplications({
    page: currentPage,
    pageSize: 10,
    search: params.search,
    status: params.status as ApplicationStatus,
    semesterId: selectedSemester?.id,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">转学申请管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            查看和审核当前所选学期
            {selectedSemester ? `“${selectedSemester.name}”` : ""}
            的学生转学申请。
          </p>
        </div>
        <ApplicationImportExportToolbar
          search={params.search}
          status={params.status}
          disabled={!selectedSemester}
        />
      </div>
      <ApplicationFilters />
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>学生姓名</TableHead>
              <TableHead>身份证号</TableHead>
              <TableHead>当前学校与年级</TableHead>
              <TableHead>申请转入年级</TableHead>
              <TableHead>分配学校</TableHead>
              <TableHead>户籍类型</TableHead>
              <TableHead>房产情况</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-muted-foreground"
                >
                  暂无转学申请数据
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>{app.idCard}</TableCell>
                  <TableCell>
                    {app.currentSchool} <br />
                    <span className="text-xs text-muted-foreground">
                      {app.currentGrade}
                    </span>
                  </TableCell>
                  <TableCell>{app.targetGrade}</TableCell>
                  <TableCell>{app.targetSchool || "-"}</TableCell>
                  <TableCell>
                    {app.residencyType === "LOCAL" ? "城中区" : "非城中区"}
                  </TableCell>
                  <TableCell>{PROPERTY_TYPE_LABELS[app.propertyType]}</TableCell>
                  <TableCell>
                    {formatBeijingDate(app.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[app.status].variant}>
                      {statusMap[app.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/applications/${app.id}`}>
                        查看详情
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          共 {meta.total} 条申请记录
        </p>
        <ApplicationPagination
          currentPage={meta.currentPage}
          pageCount={meta.pageCount}
        />
      </div>
    </div>
  );
}
