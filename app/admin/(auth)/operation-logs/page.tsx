import type { OperationLogAction } from "@prisma/client";

import { listOperationLogs } from "@/app/actions/operation-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/prisma";
import { getAdminSelectedSemester } from "@/lib/admin-selected-semester";
import {
  applicationStatusLabels,
  operationActionLabels,
  parseOperationLogDetails,
} from "@/lib/operation-log";
import { requireCurrentAdmin } from "@/lib/admin-session";

type OperationLogSearchParams = Promise<{
  adminId?: string;
  action?: OperationLogAction | "";
  targetId?: string;
}>;

export default async function OperationLogsPage({
  searchParams,
}: {
  searchParams: OperationLogSearchParams;
}) {
  await requireCurrentAdmin();

  const { adminId = "", action = "", targetId = "" } = await searchParams;
  const selectedSemester = await getAdminSelectedSemester();

  const [admins, logsResult] = await Promise.all([
    prisma.admin.findMany({
      orderBy: { username: "asc" },
      select: {
        id: true,
        username: true,
        name: true,
      },
    }),
    listOperationLogs({
      adminId: adminId || undefined,
      action: action || undefined,
      targetId: targetId || undefined,
      semesterId: selectedSemester?.id,
    }),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">操作记录</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          查询当前所选学期
          {selectedSemester ? `“${selectedSemester.name}”` : ""}
          内后台管理员对申请单状态的处理记录。
        </p>
      </div>

      <form className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="operation-log-admin">
            操作人
          </label>
          <select
            id="operation-log-admin"
            name="adminId"
            defaultValue={adminId}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            <option value="">全部管理员</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name || admin.username}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="operation-log-action">
            操作类型
          </label>
          <select
            id="operation-log-action"
            name="action"
            defaultValue={action}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            <option value="">全部类型</option>
            <option value="APPLICATION_STATUS_CHANGED">申请单状态变更</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="operation-log-target">
            申请单 ID
          </label>
          <Input
            id="operation-log-target"
            name="targetId"
            defaultValue={targetId}
            placeholder="输入申请单 ID"
          />
        </div>
        <div className="flex items-end gap-3">
          <Button type="submit">查询</Button>
          <Button type="reset" variant="outline" asChild>
            <a href="/admin/operation-logs">重置</a>
          </Button>
        </div>
      </form>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead>操作人</TableHead>
              <TableHead>操作类型</TableHead>
              <TableHead>目标</TableHead>
              <TableHead>详情</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(logsResult.data ?? []).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  暂无符合条件的操作记录。
                </TableCell>
              </TableRow>
            ) : (
              (logsResult.data ?? []).map((log) => {
                const details = parseOperationLogDetails(log.details);
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.createdAt).toLocaleString("zh-CN")}
                    </TableCell>
                    <TableCell>
                      {log.adminName || log.admin?.name || log.adminUsername}
                    </TableCell>
                    <TableCell>{operationActionLabels[log.action]}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.targetId}
                    </TableCell>
                    <TableCell className="space-y-1 text-sm">
                      <div>
                        {details.fromStatus
                          ? applicationStatusLabels[details.fromStatus]
                          : "-"}{" "}
                        →{" "}
                        {details.toStatus
                          ? applicationStatusLabels[details.toStatus]
                          : "-"}
                      </div>
                      {details.adminRemark ? (
                        <div className="text-muted-foreground">
                          备注：{details.adminRemark}
                        </div>
                      ) : null}
                      {details.targetSchool ? (
                        <div className="text-muted-foreground">
                          目标学校：{details.targetSchool}
                        </div>
                      ) : null}
                      {details.rejectedFields?.length ? (
                        <div className="text-muted-foreground">
                          驳回字段：{details.rejectedFields.join("、")}
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
